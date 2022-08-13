<?php

namespace Controls\Functions;

use Controls\Router\routing;


class init
{
    use sanitizer;
    public function load(){
        $router= new routing();
        $input=file_get_contents('php://input');
        $request=  $_SERVER['REQUEST_URI'] === ($_SERVER['APP_BASE'] ?? '') ? '/index.html' : $_SERVER['REQUEST_URI'];

        if(!empty($input)){
           return $this->runCommand($input, $_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI'],);
        }else if ($router->routing($request)){
           return $this->run();
        }
    }
    public function runCommand($input,$method,$uri){
        $uri=$this->sanitazeUri($uri);
        $input=json_decode($input,true);

//        $input =$this->sanitazeData($input);

        $user= new User();

        switch ($uri){
            case 'register': $user->register($input);
                break;
            case'login': $user->login($input);
                break;
            case'history': $user->saveSearch($input);
                break;
            case 'saved_data':$data= new weatherData();
             return json_encode($data->handleData($input,$method),true);
                break;
            default: return false;


        }


    }

    public function run():string
    {
        $data=[
            'h1'=>'My First Heading',
            'p1'=>'Myfirst paragraph'
        ];
        $dummyArray=[
            '{{language}}'=>'en',
            '{{title}}'=>'<title>PageTitle</title>',
            '{{meta}}'=>'',
            '{{css}}'=>'',
            '{{page}}'=>'index',
            '{{data}}'=>json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT),
            '{{js}}'=>'<script type="module" src="Assets/development/js/dexie.mjs"></script>
                       <script type="module" src="Assets/development/js/main.js"></script>'
        ];
        $bluePrint=file_get_contents('Views/Html/htmlBlueprint.tpl');
        $html=strtr($bluePrint,$dummyArray);
        return $html;

 }

}