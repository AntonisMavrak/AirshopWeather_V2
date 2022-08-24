<?php

namespace Controls\Router;

use Controls\Database\Database;
use Controls\Functions\sanitizer;

class routing
{
    use sanitizer;
    use Database;


    // Receives a page and checks if it ends in .html or not
    public function routing($page):bool
    {
        $page = mb_strtolower($page);

        // Checks if page ends in '.html'
        if ((strlen($page) - strlen('.html')) === strrpos($page, '.html')) {

            $namePage = $this->sanitizePage($page);
            if($this->isRegisteredPage($namePage)===false){
                return false;
            }
            return true;
        } else {
            echo 'Page does not end in .html';
            return  false;
        }

    }

    // Checks if page is registered in MongoDB
    public function isRegisteredPage($pageName)
    {
        $collection = $this->mongo('pages');
        $match = [
            'name' => $pageName
        ];
        $options = [

        ];

        $pagesData = $collection->findOne($match, $options);


        if ($pagesData!==null) {
            $dataEncoded = json_encode($pagesData['template']['{{data}}'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            $pagesData['template']['{{data}}'] = $dataEncoded;

            return $pagesData['template'];
        }
        echo 'Page is not registered';
        return  false;
    }


}