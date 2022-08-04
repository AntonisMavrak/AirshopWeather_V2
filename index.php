<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
require_once "vendor/autoload.php";
// The requests must be on the following format:
//https://domain.gr/someCommand-commandData.html
//
use Controls\Error\errorException;
$error =new errorException();
set_error_handler([$error,'error_callback']);
set_exception_handler([$error,'except_callback']);


$load= new Controls\Functions\init();

if($load->load()===false){
    throw new \ErrorException("command not found");
}

