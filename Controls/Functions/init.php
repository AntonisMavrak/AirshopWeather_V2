<?php

namespace Controls\Functions;

use Controls\Database\Database;
use Controls\Router\routing;


class init
{
    use sanitizer;
    use Database;

    // Checks if user send something with the request
    // If send something run the correct command
    // Else redirect him to the page that was requested
    public function load()
    {
        $router = new routing();
        $input = file_get_contents('php://input');
        $request = $_SERVER['REQUEST_URI'] === ($_SERVER['APP_BASE'] ?? '') ? '/index.html' : $_SERVER['REQUEST_URI'];


        //var_dump($input);

        if (!empty($input)) {
            return $this->runCommand($input, $_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
        } else if ($router->routing($request)) {
            session_start();
            session_regenerate_id(true);

            if(isset($_SESSION["usernameL"])){
//                var_dump($_SESSION["usernameL"]);
                return $this->run($this->isRegisteredPage('loginPage'));
            }else{

            return $this->run($this->isRegisteredPage('index'));}
        }
    }

    // Checks which command the user requested
    public function runCommand($input, $method, $uri)
    {
        $uri = $this->sanitizeUri($uri);
        parse_str($input, $data);
//        var_dump($input);
//        $in = json_decode($input,true);
        $decodeInput = json_decode(json_encode($data), true);

        //var_dump($decodeInput);

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
                $user->saveSearch($input, $uri);
                break;
            case 'saved_data':
                $data = new weatherData();
                return json_encode($data->handleData($this->sanitizeInput($input), $method), true);
            case 'error_log':
                $error=new errorLog;
                $error->recordError($input);
                break;
            default:
                return false;


        }


    }

    // Builds the page that is requested based of the string that was passed
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

    // Checks if page is registered in the MongoDB
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