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
            return  $this->isRegisteredPage($namePage);
        } else {
            echo 'Page does not end in .html';
            return  false;
        }

    }

    // Checks if page is registered in MongoDB
    private function isRegisteredPage($pageName): bool
    {
        $collection = $this->mongo('pages');
        $match = [
            'name' => $pageName
        ];
        $options = [

        ];

        $pagesData = $collection->findOne($match, $options);

        if ($pagesData!==null) {
            return true;
        }
        echo 'Page is not registered';
        return false;
    }

}