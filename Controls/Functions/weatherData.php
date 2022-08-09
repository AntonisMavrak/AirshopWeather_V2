<?php

namespace Controls\Functions;

use Controls\Database\Database;
use MongoDB\BSON\UTCDateTime;

class weatherData
{
    use Database;

    // If method is 'GET' then checks if data exist else call 'recordData()'
    function handleData($input, $method)
    {
        $collection = $this->mongo('weatherdata');
        return ($method === "GET") ? $this->checkData($input, $collection) : $this->recordData($input, $collection);
    }

    // Checks if data already exist in the db
    private function checkData($input, $collection)
    {

        $match = [
            'location' => $input['location']
        ];
        $options = [

        ];
        try {
            $weatherData = $collection->findOne($match, $options);
            return ($weatherData === NULL) ? false : $weatherData;
        } catch (\Exception $e) {
            var_dump($e);
        }
    }

    // If data does not exist in db save it in db
    private function recordData($input, $collection)
    {
        if ($this->checkData($input, $collection) === false) {
            try {
                $date = new UTCDateTime();
                $insertData = $collection->insertOne([              //ama kani kapoios request bori na gemisi thn bash
                    'expireAt' => $date,
                    'location' => $input['location'],               //prepi na doume an kapoios vali dika tou data sto request kai oxi apo to openWeather opote isos prepi na valoume kapoio flag metaji mas
                    'temperature' => $input['temperature']
                ]);
                return true;
            } catch (\Exception $e) {
                echo "error message: " . $e->getMessage() . "\n";
                echo "error code: " . $e->getCode() . "\n";
            }
        } else {
            return "Already registered";
        }
    }

}