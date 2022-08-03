<?php

namespace Controls\Database;

use MongoDB\Client as Mongo;
use MongoDB\Collection;

trait Database
{
    public function mongo($mongoCollection): Collection
    {
        $mongoConnection = new Mongo('mongodb://' .
            $_SERVER['APP_DB_USER'] . ':' .
            rawurlencode($_SERVER['APP_DB_PASS']) . '@' .
            $_SERVER['APP_DB_ADDRESS'] . ':' .
            $_SERVER['APP_DB_PORT'] . '/?authSource=' .
            $_SERVER['APP_DB_AUTH']);
        
        $db = $mongoConnection->selectDatabase('Weather');
        return $db->selectCollection($mongoCollection);
    }
}