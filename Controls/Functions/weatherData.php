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

            $match = [
                'location' => $input['location']
            ];
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

                $insertData = $collection->insertOne([              //ama kani kapoios request bori na gemisi thn bash
                    'expireAT' => 'new MongoDB\BSD',
                    'location' => $input['location'],               //prepi na doume an kapoios vali dika tou data sto request kai oxi apo to openWeather opote isos prepi na valoume kapoio flag metaji mas
                    'temperature' => $input['temperature']
                ]);
                return true;
            } catch (\MongoCursorException $e) {
                echo "error message: " . $e->getMessage() . "\n";
                echo "error code: " . $e->getCode() . "\n";
            }
        }else{
            return "exi gini egrafh";
        }
    }

}