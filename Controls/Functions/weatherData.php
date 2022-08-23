<?php

namespace Controls\Functions;

use Controls\Database\Database;
use MongoDB\BSON\UTCDateTime;

class weatherData
{
    use Database;

    // Handles the data based on the method that was requested
    function handleData($input, $method)
    {
        $collection = $this->mongo('weatherdata');
        return ($method === "POST") ? $this->checkData($input, $collection) : $this->recordData($input, $collection);
    }

    // Returns data from MongoDB based on the data that was passed
    private function checkData($input, $collection)
    {

        $match = ['location' => $input['location'],
            'type' => $input['type']];

        $options = [
        ];

        try {
            $weatherData = $collection->findOne($match, $options);
            return ($weatherData === NULL) ? false : $weatherData;

        } catch (\Exception $e) {
            var_dump($e);
        }
    }

    // Checks if data exist in MongoDB and if not it registers it
    private function recordData($input, $collection)
    {

        if ($this->checkData($input, $collection) === false) {
            try {
                $input['data'] = json_decode($input['data'], true);
                $date = new UTCDateTime();
                $insertData = $collection->insertOne([
                    'expireAt' => $date,
                    'location' => $input['location'],
                    'type' => $input['type'],
                    'data' => $input['data']

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