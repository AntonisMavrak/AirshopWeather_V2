<?php

namespace Controls\Functions;

use Controls\Database\Database;
use Controls\Error\errorException;
use function PHPUnit\Framework\throwException;

class User
{
    use Database;

    // Register new user to database
    public function register($input)
    {

        if ($this->isRegisteredUser($input['usernameR']) !== null) {
            echo "<script>window.location.href = 'index.html'
                  alert('User already exists')</script>";
        } else {
            $collection = $this->mongo('users');
            try {
                $collection->insertOne([
                    'name' => $input['fullname'],
                    'username' => $input['usernameR'],
                    'email' => $input['emailR'],
                    'password' => $input['pwdR'],
                    'history' => []
                ]);

                echo "<script>window.location.href = 'index.html'
                      alert('Registered successfully')</script>";

            } catch (\Exception $e) {
                echo "<script>window.location.href = 'index.html'
                      alert('Something went wrong')</script>";
            }
        }

    }


    // Check if user exist.
    // If user exists then save id and name to session
    public function login($input)
    {

        $existingUser = $this->isRegisteredUser($input['usernameL']);
        if ($existingUser !== null) {
            if ($input['pwdL'] === $existingUser['password']) {
                $_SESSION["usernameL"] = $input['usernameL'];
                $_SESSION["id"] = $existingUser["_id"];
                echo "<script>window.location.href = 'index.html'
                      alert('Successfully logged in!!') </script>";
            } else {
                echo "<script> window.location.href = 'index.html'
                    alert('User does not exist') </script>";
            }
        } else {
            echo "<script> window.location.href = 'index.html'
                        alert('User does not exist')</script>";
        }
    }


    // Logout user and clears session
    public function logout()
    {
        unset($_SESSION["id"]);
        unset($_SESSION["usernameL"]);
        unset($_SESSION["pwdL"]);
        echo "<script> window.location.href = 'index.html'
              alert('Successfully logged out!!')</script>";
    }


    // Checks database if user is registered in database
    public function isRegisteredUser($name)
    {
        $collection = $this->mongo('users');
        $match = [
            'username' => $name
        ];
        $options = [
        ];
        return $collection->findOne($match, $options);
    }

    // Saves the last 10 searches that the user chose
    public function saveSearch($input, $historyFlag)
    {

        $name = $_SESSION["usernameL"];
        $historyData = $input['type'] . " " . $input['location'] . ", " . $input['sCountry'];


        if ($historyData == !null) {

            $collection = $this->mongo('users');
            $match = [
                'username' => $name
            ];
            $insert = ['$push' => [
                $historyFlag => $historyData
            ]
            ];
            $options = [

            ];
            $delete = ['$pop' =>
                [$historyFlag => -1]
            ];

            $pagesData = $collection->findOne($match, $options);

            if (count($pagesData[$historyFlag]) >= 10) {
                $collection->updateOne($match, $delete);
            }
            $collection->updateOne($match, $insert);

            $this->showSearch($pagesData, $historyFlag);

            header("Location: index.html");

        } else {
            echo '<script>alert("Insert Data !!!")</script>';
        }
    }

    // Returns true if there are searches of the user and echos them
    private function showSearch($pagesData, $historyFlag): bool
    {

        if ($pagesData !== null) {
            foreach ($pagesData[$historyFlag] as $pageData) {
                echo '<br>' . $pageData . '<br>';
            }
            return true;
        }
        return false;


    }


}