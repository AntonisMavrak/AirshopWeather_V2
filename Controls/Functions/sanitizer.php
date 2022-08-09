<?php

namespace Controls\Functions;

trait sanitizer
{

    // Get the page name from the rest of the uri, remove special chars and remove the '.html'
    public function sanitizePage($uri): string
    {
        $words = explode('/', $uri);
        $lastWord = array_pop($words);
        $lastWord = preg_replace("/[^a-zα-ωά-ώ\d\/\-\._]+/u", '', $lastWord);
        return preg_replace("/\.html$/", '', $lastWord);
    }

    // Remove special chars from the data
    public function sanitazeData($input)
    {
        foreach ($input as $x=>$value) {
            $input[$x]=preg_replace("/[^a-zα-ωά-ώ\d\/\-\._]+/u", '', $value);

        }
        return $input;
    }
}