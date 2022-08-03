<?php

namespace Controls\Headers;

trait headers
{
    public function set_headers($data = 'html')
    {
        switch ($data) {
            case 'json':
                header("Content-type: application/json; charset=utf-8");
                break;
            case 'xml':
                header('Content-Type: application/xml; charset=utf-8');
                break;
            default:
                header("Content-Type: text/html; charset=utf-8");
        }
    }
}