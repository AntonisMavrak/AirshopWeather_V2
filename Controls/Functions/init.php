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

        session_start();

        if (!empty($input)) {
            return $this->runCommand($input, $_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
        } else if ($router->routing($request)) {

            if(isset($_SESSION["usernameL"])){
//                var_dump($_SESSION["usernameL"]);
               return  $this->run($router->isRegisteredPage('index'));
            }else{

              return  $this->run($router->isRegisteredPage('loginpage'));
            }

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
        $bluePrint = file_get_contents('Views/Html/htmlBlueprint.tpl');

        $arrayTemplate = (array) $template;


        return strtr($bluePrint, $arrayTemplate);

    }

}