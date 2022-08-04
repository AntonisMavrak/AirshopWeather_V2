<?php

namespace Controls\Headers;

trait headers
{
    public function set_headers($headerType = 'html')
    {
        switch (strtolower($headerType)) {
            case 'html':
                header("Content-Type: text/html; charset=utf-8");
                break;
            default:
                header("Content-Type: application/$headerType; charset=utf-8");
        }
    }
}