<?php

namespace Controls\Functions;

use Controls\Database\Database;
use MongoDB\BSON\UTCDateTime;

class weatherData
{
    use Database;

    function handleData($input, $method)
    {   //an inai allh method?
        // TODO CHECK METHOD
        // TODO CONNECT DB
        $collection = $this->mongo('weatherdata');
        return ($method === "POST") ? $this->checkData($input, $collection) : $this->recordData($input, $collection);
    }

    private function checkData($input, $collection)
    {
//        print_r($input);
//        $input= json_decode(json_encode($input, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),true);

//        $input1 = (array) $input;
//        $input = json_decode($input,true);

            $match = [ 'location'=>$input['location'],
                'type' => $input['type']];

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

        if ($this->checkData($input, $collection)===false)
        {
            try {
                $input['data']=json_decode($input['data'],true);
                 $date= new UTCDateTime();
                $insertData = $collection->insertOne([              //ama kani kapoios request bori na gemisi thn bash
                    'expireAt' =>   $date,
                    'location'=>$input['location'],
                    'type' => $input['type'] ,           //na tsekaroume an exei data to array pou erxetai
                    'data'=> $input['data']

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