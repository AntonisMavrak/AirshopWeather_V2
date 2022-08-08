<?php

namespace Controls\Functions;

use Controls\Database\Database;

class User
{
    use Database;

    public function register($input)
    {
        $name = $input['name'];
        $password = $input['password'];
        if ($this->isRegisteredUser($name) !== null) {
            echo '<script>alert("User already exists")</script>';
        } else {
            $collection = $this->mongo('users');
            try {
                $collection->insertOne(['name' => $name, 'password' => $password]);
                echo '<script>alert("Registered successfully")</script>';
            } catch (\Exception $e) {
                echo '<script>alert("Something went wrong")</script>';
            }
        }

    }

    public function login($input)
    {
        $name = $input['name'];
        $password = $input['password'];
        $existingUser = $this->isRegisteredUser($name);
        if ($existingUser !== null) {
            if ($password === $existingUser["password"]) {
//                $_SESSION["name"] = $name;
//                $_SESSION["id"] = $existingUser["id"];
                echo '<script>alert("Successfully logged in!!")</script>';
            }
        } else {
            echo '<script>alert("User does not exist")</script>';
        }

    }

    public function isRegisteredUser($name)
    {
        $collection = $this->mongo('users');
        $match = [
            'name' => $name
        ];
        $options = [

        ];
        $exist = $collection->findOne($match, $options);

        return $exist;

    }


    public function saveSearch($input)
    {
        // mallon meta to login

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