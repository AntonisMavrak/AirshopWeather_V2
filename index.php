<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
require_once "vendor/autoload.php";

use Controls\Error\errorException;

$error = new errorException();
set_error_handler([$error, 'error_callback']);
set_exception_handler([$error, 'except_callback']);