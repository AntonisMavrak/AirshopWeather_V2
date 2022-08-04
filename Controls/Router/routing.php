<?php

namespace Controls\Router;

use Controls\Functions\sanitizer;

class routing
{

    use sanitizer;
    public function load(): string
    {
        $input = file_get_contents('php://input');
        $request = $_SERVER['REQUEST_URI'] === ($_SERVER['APP_BASE'] ?? '') ? '/index.html' : $_SERVER['REQUEST_URI'];

        /* TODO
            Check if $request exist in database
        */
        return !empty($input) ? $this->run_command($input) : $this->routing($request);
    }

    public function routing($request)
    {
        return $this->sanitizeURI($request);
    }

    public function run_command($input): string
    {
        return ("We don't care about this");
    }

//    public function existInDB($request): bool{
//
//    }
}