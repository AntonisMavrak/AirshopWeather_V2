<?php

namespace Controls\Router;

use Controls\Database\Database;
use Controls\Functions\sanitizer;

class routing
{
    use sanitizer;
    use Database;
    public function routing($page)
    {
        //        TODO LowerCase transformation
        $page = mb_strtolower($page);
        if ((strlen($page) - strlen('.html')) === strrpos($page, '.html')) {
            $namePage = $this->sanitazePage($page);
            return  $this->isRegisteredPage($namePage);
        } else {
            echo 'den teliwnei se .html';
            return  false;
        }

    }

    private function isRegisteredPage($pageName)
    {
        $collection = $this->mongo('pages');
        $match = [
            'name' => $pageName
        ];
        $options = [

        ];

        $pagesData = $collection->findOne($match, $options);

        if ($pagesData!==null) { // ?
            return true;
        }
        return false;
    }

}