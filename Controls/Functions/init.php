<?php

namespace Controls\Functions;

use Controls\Router\routing;


class init
{
    use sanitizer;

    /* Checks if user has inputted data
     If user inputted data then run command that he chose
     If not redirect him to another page */
    public function load()
    {
        $router = new routing();
        $input = file_get_contents('php://input');
        $request = $_SERVER['REQUEST_URI'] === ($_SERVER['APP_BASE'] ?? '') ? '/index.html' : $_SERVER['REQUEST_URI'];
        return !empty($input) ? $this->runCommand($input, $_SERVER['REQUEST_METHOD']) : $router->routing($request);
    }

    // Checks what kind of command the user wanted and runs it
    public function runCommand($input, $method)
    {
        $input = json_decode($input, true);
        $input = $this->sanitazeData($input);
        $user = new User();

        switch ($input['flag']) {
            case 'register':
                $user->register($input);
                break;
            case'login':
                $user->login($input);
                break;
            case'history':
                $user->saveSearch($input);
                break;
            case 'saved_data':
                $data = new weatherData();
                return $data->handleData($input, $method);
                break;
            default:
                return false;
        }
    }

    // Fill html document with data
    public function run(): string
    {
        $data = [
            'h1' => 'My First Heading',
            'p1' => 'My first paragraph'
        ];
        $dummyArray = [
            '{{language}}' => 'en',
            '{{title}}' => '<title>PageTitle</title>',
            '{{meta}}' => '',
            '{{css}}' => '',
            '{{page}}' => 'index',
            '{{data}}' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            '{{js}}' => '<script type="module" src="Assets/development/js/dexie.mjs"></script><script type="module" src="Assets/development/js/main.js"></script>'
        ];
        $bluePrint = file_get_contents('Views/htmlBluePrint.tpl');
        $html = strtr($bluePrint, $dummyArray);
        return $html;

    }

}