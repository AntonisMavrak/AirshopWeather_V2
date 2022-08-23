<?php

namespace Controls\Functions;

use Controls\Database\Database;
use Controls\Router\routing;


class init
{
    use sanitizer;
    use Database;

    public function load()
    {
        $router = new routing();
        $input = file_get_contents('php://input');
        $request = $_SERVER['REQUEST_URI'] === ($_SERVER['APP_BASE'] ?? '') ? '/index.html' : $_SERVER['REQUEST_URI'];
        session_start();
        session_regenerate_id(true);

        //var_dump($input);

        if (!empty($input)) {
            return $this->runCommand($input, $_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
        } else if ($router->routing($request)) {

            if(isset($_SESSION["usernameL"])){
//                var_dump($_SESSION["usernameL"]);
                return $this->run($this->isRegisteredPage('loginPage'));
            }else{

            return $this->run($this->isRegisteredPage('index'));}
        }
    }

    public function runCommand($input, $method, $uri)
    {

        $uri = $this->sanitazeUri($uri);
        parse_str($input, $data);
//        var_dump($input);
//        $decodeInput = json_decode($input,true);
        $decodeInput = json_decode(json_encode($data), true);



        $user = new User();

        switch ($uri) {
            case 'register':
                $user->register($decodeInput);
                break;
            case'login':
                $user->login($decodeInput);
                break;
            case'logout':
                $user->logout();
                break;
            case'history':
                $user->saveSearch($decodeInput, $uri);
                break;
            case 'saved_data':
                $data = new weatherData();
                return json_encode($data->handleData(json_decode($input,true), $method), true);
            default:
                return false;


        }


    }

    public function run($template): string
    {
//        $data=[
//            'h1'=>'Weather App',
//            'a1'=>'LOGIN',
//            'a2'=>'REGISTER',
//            'label1'=>'Username',
//            'label2'=>'Password',
//            'buttonL'=>'Log in',
//            'label3'=>'Name',
//            'label4'=>'Username',
//            'label5'=>'Email',
//            'label6'=>'Password',
//            'buttonS'=>'Sign in'
//        ];
//        $dummyArray=[
//            '{{language}}'=>'en',
//            '{{title}}'=>'<title>PageTitle</title>',
//            '{{meta}}'=>'',
//            '{{css}}'=>'<link rel="stylesheet" href="Assets/Development/Css/appCss.css">',
//            '{{page}}'=>'index',
//            '{{data}}'=>json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT),
//            '{{js}}'=>'<script type="module" src="Assets/Development/Js/dexie.mjs"></script>
//                       <script type="module" src="Assets/Development/Js/main.js"></script>'
//        ];
        $bluePrint = file_get_contents('Views/Html/htmlBlueprint.tpl');

        $arrayTemplate = (array) $template;

        return strtr($bluePrint, $arrayTemplate);

    }
// private function getData(){
//     if ( isset( $_POST['submitL'] ) ) {
//         $username = $_POST['usernameL'];
//         $pwd = $_POST['pwdL'];
//         $flag = 'login';
//         echo 'Your name is ' . $username;
//         return true;
//     }
// }

    public function isRegisteredPage($name)
    {
        $collection = $this->mongo('pages');
        $match = [
            'name' => $name
        ];
        $options = [

        ];
        $data = $collection->findOne($match, $options);


        $dataEncoded = json_encode($data['template']['{{data}}'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        $data['template']['{{data}}'] = $dataEncoded;

        return $data['template'];
    }
}