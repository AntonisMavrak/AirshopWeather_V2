<?php

namespace Controls\Functions;

use Controls\Database\Database;
use MongoDB\BSON\UTCDateTime;

class errorLog
{
    use Database;
    public function recordError($input){
        $collection = $this->mongo('errors');

        try {
            $input = json_encode($input, true);
            $date = new UTCDateTime();
            $insertData = $collection->insertOne([
                'date' => $date,
                'error' => $input,


            ]);
            return true;
        } catch (\Exception $e) {
            echo "error message: " . $e->getMessage() . "\n";
            echo "error code: " . $e->getCode() . "\n";
        }
    }
}