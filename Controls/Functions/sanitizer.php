<?php

namespace Controls\Functions;

trait sanitizer
{
    public function sanitizeURI($uri): string
    {
        mb_strtolower($uri, 'UTF-8');

    }

}