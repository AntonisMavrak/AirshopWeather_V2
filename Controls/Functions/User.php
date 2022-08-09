<?php

namespace Controls\Functions;

use Controls\Database\Database;

class User
{
    use Database;

    // Register new user to database
    public function register($input)
    {
        if ($this->isRegisteredUser($input['name']) !== null) {
            echo '<script>alert("User already exists")</script>';
        } else {
            $collection = $this->mongo('users');
            try {
                $collection->insertOne(['name' => $input['name'], 'password' => $input['password']]);
                echo '<script>alert("Registered successfully")</script>';
            } catch (\Exception $e) {
                echo '<script>alert("Something went wrong")</script>';
            }
        }

    }

    // Check if user exist.
    // If user exists then save id and name to session
    public function login($input)
    {
        $existingUser = $this->isRegisteredUser($input['name']);
        if ($existingUser !== null) {
            if ($input['password'] === $existingUser["password"]) {
                session_start();
                $_SESSION["name"] = $input['name'];
                $_SESSION["id"] = $existingUser["_id"];

                echo '<script>alert("Successfully logged in!!")</script>';
            }
        } else {
            echo '<script>alert("User does not exist")</script>';
        }

    }

    // Checks database if user is registered in database
    public function isRegisteredUser($name)
    {
        $collection = $this->mongo('users');
        $match = [
            'name' => $name
        ];
        $options = [

        ];
        return $collection->findOne($match, $options);

    }

    // Save the last 10 searches that the user chose
    public function saveSearch($input)
    {

        $name = $input['name'];
        $historyFlag = $input['flag'];
        $historyData = $input['data'];

        if ($historyData==!null) {

            $collection = $this->mongo('users');
            $match = [
                'name' => $name
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

            if (count($pagesData[$input['flag']]) >= 10) {
                $collection->updateOne($match, $delete);
            }
            $collection->updateOne($match, $insert);

            $this->showSearch($pagesData, $historyFlag);
        }else{
            echo '<script>alert("Insert Data !!!")</script>';
        }
    }

    // Returns the searches that have been saved in the db
    private function showSearch($pagesData, $historyFlag)
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