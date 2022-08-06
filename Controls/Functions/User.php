<?php

namespace Controls\Functions;

use Controls\Database\Database;

class User
{
    use Database;

    public function register($input)
    {
        $name=$input['name'];
        $password=$input['password'];
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
        $name=$input['name'];
        $password=$input['password'];
        $existingUser = $this->isRegisteredUser($name);
        if ($existingUser !== null) {
            if ($password === $existingUser["password"]){
//                $_SESSION["name"] = $name;
//                $_SESSION["id"] = $existingUser["id"];
                echo '<script>alert("Successfully logged in!!")</script>';
            }
        }else{
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
        // TODO connect to DB
        $collection = $this->mongo('user');

        // TODO find user
        $match = [
            'name' => 'Stella Boukla'
        ];

        //TODO insert table
        $insert = ['$push' => [
            $input['flag'] => $input['data']
        ]
        ];
        $options = [

        ];
        //TODO delete table
        $delete=['$pop'=>
            [$input['flag']=>-1]
        ];

        $pagesData = $collection->findOne($match, $options);

        if (count($pagesData[$input['flag']]) >= 10) {
            $collection->updateOne($match, $delete);
        }
        $collection->updateOne($match, $insert);

        $this->showSearch($input['flag']);
    }

    private function showSearch($input)
    {
        // TODO connect to DB
        $collection = $this->mongo('user');

        // TODO check if page with name exists
        $match = [
            'name' => 'Stella Boukla'
        ];
        $options = [

        ];
        $pagesData = $collection->findOne($match, $options);

        if ($pagesData !== null) {
//            for($i=1;$i<count($pagesData);$i++){
//                echo '<br>'.$pagesData[$input]['search'.$i].'<br>';
//            }
            foreach ($pagesData[$input] as $pageData) {
                echo '<br>' . $pageData . '<br>';
            }
            return true;
        }
        return false;


    }

}