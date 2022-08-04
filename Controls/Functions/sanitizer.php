<?php

namespace Controls\Functions;

trait sanitizer
{
    public function sanitazePage($uri): string
    {
        //        TODO get the last word *.html
        //        TODO replace special chars
        //        TODO get the last word with out .html
        $words = explode('/', $uri);
        $lastWord = array_pop($words);
        $lastWord = preg_replace("/[^a-zα-ωά-ώ\d\/\-\._]+/u", '', $lastWord);
        return preg_replace("/\.html$/", '', $lastWord);
    }



}