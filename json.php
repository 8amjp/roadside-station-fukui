<?php
header("Content-Type: application/json; charset=utf-8");

$t = new DateTime();
$data = file("http://linkdata.org/api/1/rdf1s1947i/mitinoeki_tsv.txt", FILE_IGNORE_NEW_LINES);
$json = array();
foreach ($data as $line) {
    if ( !preg_match('/^#/', $line) ) {
        $a = explode("\t", $line);
        $json[$a[0]] = array (
            'id'       => $a[0], // ID
            'name'     => $a[1], // 名称
            'address'  => $a[2], // 所在地
            'road'     => $a[3], // 路線名
            'tel'      => $a[4], // 電話番号
            'provider' => $a[5], // 設置者
            'lat'      => $a[6], // 緯度
            'lng'      => $a[7]    // 経度
        );
    }
}

echo sprintf("mitinoeki(%s)",json_encode($json));
exit;
?>