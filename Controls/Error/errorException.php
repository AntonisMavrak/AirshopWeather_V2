<?php

namespace Controls\Error;

use Controls\Headers\headers;

class errorException
{
    use headers;
    public function error_callback(int $errNo, string $errMsg, string $errFile, int $errLine)
    {
        $time = date("Y-m-d H:i:s");
        $errorArray = [
            "type" => "error",
            "eventData" => $time,
            "number" => $errNo,
            "message" => $errMsg,
            "file" => $errFile,
            "line" => $errLine
        ];

        $this->set_headers('json');
        echo json_encode($errorArray,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
        die;
    }

    public function except_callback(\Throwable $e)
    {
        $time = date("Y-m-d H:i:s");
        $exceptionArray = [
            "type" => "exception",
            "eventData" => $time,
            "message" => $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine(),
            "trace" => $e->getTrace()
        ];

        $this->set_headers('json');
        echo json_encode($exceptionArray,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
        die;
    }
}