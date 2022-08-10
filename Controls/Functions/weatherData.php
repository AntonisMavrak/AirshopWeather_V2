<?php

namespace Controls\Functions;

use Controls\Database\Database;
use MongoDB\BSON\UTCDateTime;

class weatherData
{
    use Database;

    function handleData($input, $method)
    {   //an inai allh method?
        // TODO CHEK METHOD
        // TODO CONNECT DB
        $collection = $this->mongo('weatherdata');
        return ($method === "GET") ? $this->chekData($input, $collection) : $this->recordData($input, $collection);
    }

    private function chekData($input, $collection)
    {
            $match = ["location"=>(isset($input['name'])?$input['name']:"Athens"),
                      "data"=> (isset($input['name'])?'weather':"airpollution") ];

            $options = [

            ];

        try {
            $weatherData = $collection->findOne($match, $options);
            return ($weatherData === NULL) ? false : $weatherData;

        }catch (\Exception $e){
            var_dump($e);
        }
    }

    private function recordData($input, $collection)
    {

        if ($this->chekData($input, $collection)===false)
        {
            try {
                 $date= new UTCDateTime();
                $insertData = $collection->insertOne([              //ama kani kapoios request bori na gemisi thn bash
                    'expireAt' =>   $date,
                    'location'=>(isset($input['name'])?$input['name']:"Athens"),
                    isset($input['name'])?'weather':"airpollution" => $input ,
                    'data'=> isset($input['name'])?'weather':"airpollution"

                ]);
                return true;
            } catch (\Exception $e) {
                echo "error message: " . $e->getMessage() . "\n";
                echo "error code: " . $e->getCode() . "\n";
            }
        }else{
            return "exi gini egrafh";
        }
    }

}