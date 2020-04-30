<?php

// don't allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['shoppingCart'])) {
    die();
}

require_once __DIR__ . "/php/controller/controller.php";
require_once __DIR__ . "/php/model/utils.php";

// ob_start();

$shoppingCart = json_decode($_POST['shoppingCart'], true);
// trying to order an empty cart
if (count($shoppingCart) === 0) {
    header("Location: index.php");
    die;
}

$orderTotalPrice = 0;
// check if ordered products exist and are in stock
foreach ($shoppingCart as &$cartItem) {
    // var_dump($cartItem);
    $productId = intval($cartItem['id']);
    if (doesProductIdExist($productId) === false) {
        header("Location: error.php?errorMessage=Den beställda produkten existerar inte.");
        die;
    }
    $product = getProductById($productId);
    // var_dump($product);
    $orderedQuantity = intval($cartItem['qty']);
    if ($product['number_in_stock'] < $orderedQuantity) {
        header("Location: error.php?errorMessage=Lagerstatus är för låg för att genomföra köpet.");
        die;
    }
    $orderTotalPrice = $orderTotalPrice + intval($product['price']);
}

$customerData = [
    "email" => trimSides($_POST['email']),
    "first_name" => trimSides($_POST['fname']),
    "last_name" => trimSides($_POST['lname']),
    "phone" => trimSides($_POST['phone']),
    "street" => trimSides($_POST['adress']),
    "postal_number" => trimSides($_POST['pcode']),
    "county" => trimSides($_POST['county']),
];

$customerDataId = md5(
    $customerData['email'] .
    $customerData['first_name'] .
    $customerData['first_name'] .
    $customerData['last_name'] .
    $customerData['phone'] .
    $customerData['street'] .
    $customerData['postal_number'] .
    $customerData['county']
);

// save customer data if it doesn't already exist in db
if (doesCustomerDataIdExist($customerDataId) == false) {
    saveCustomerDataToDb($customerDataId, $customerData);
}

// check if this order qualifies for free shipping
$free_shipping = false;
if ($orderTotalPrice >= 500 || strcasecmp($customerData['county'], "stockholm") == 0) {
    $free_shipping = true;
}

// create a new db entry for this order
$date_ordered_at = date('Y-m-d H:i:s', time());
$order = [
    "date_ordered_at" => $date_ordered_at,
    "status" => 1,
    "customer_data_id" => $customerDataId,
    "free_shipping" => $free_shipping,
];
createNewOrder($order);

$orderId = getOrderIdByTimeAndUser($date_ordered_at, $customerDataId);
// var_dump($orderId);

// var_dump($productListHtml);

// error_log(ob_get_clean());

$productListHtml = '';
// register products as belonging to this order
foreach ($shoppingCart as &$cartItem) {

    $productId = intval($cartItem['id']);
    $orderedQuantity = intval($cartItem['qty']);

    $product = getProductById($productId);
    createOrderedProduct($orderId, $product, $orderedQuantity);

    $coverImage = "placeholder.png";
    if (count($product["gallery"]) != 0) {
        $coverImage = $product['gallery'][0];
    }

    $itemTotalPrice = intval($product['price'] * $orderedQuantity);

    $productListHtml = $productListHtml . '
        <tr>
            <td class="item-image">
                <img class="product-cover-small" src="img/product/' . $coverImage . '" alt="' . $product["title"] . '">
            </td>
            <td class="item-name">' . $product['title'] . '</td>
            <td class="item-qty">' . $orderedQuantity . '</td>
            <td class="item-price">' . $product['price'] . '</td>
            <td class="item-total">' . $itemTotalPrice . ' kr</td>
        </tr>';
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Order</title>
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>

<body id="order-body">

    <span class="hamburger__bar-wrapper">
        <span class="hamburger__bar"></span>
        <span class="hamburger__bar"></span>
        <span class="hamburger__bar"></span>
    </span>

    <?php require_once __DIR__ . '/php/view/sidebar.php';?>
    <?php require_once __DIR__ . '/php/view/header.php';?>
    <?php require_once __DIR__ . '/php/view/cart.php';?>

    <main id="order-main">

        <section class="order-confirmation white-panel">
            <div class="panel-heading">Order bekräftelse</div>

            <div class="order-error">
                <p class="order-error-message"></p>
            </div>

            <div class="order-description">
                <p>Tack för din beställning!</p>
                <dl>
                    <dt>Kund ID:</dt>
                    <dd id="customerId"><?php echo htmlspecialchars($customerDataId, ENT_QUOTES, 'UTF-8'); ?></dd>
                    <dt>Kundnamn</dt>
                    <dd id="fullname"><?php echo htmlspecialchars($customerData['first_name'] . " " . $customerData['last_name'], ENT_QUOTES, 'UTF-8'); ?></dd>
                    <dt>Phone</dt>
                    <dd id="phone"><?php echo htmlspecialchars($customerData['phone'], ENT_QUOTES, 'UTF-8'); ?></dd>
                    <dt>Postal address</dt>
                    <dd id="address"><?php echo htmlspecialchars($customerData['street'] . ", " . $customerData['county'] . ", " . $customerData['postal_number'], ENT_QUOTES, 'UTF-8'); ?></dd>
                    <dt>Beställningsnummer:</dt>
                    <dd id="orderNumber"><?php echo $orderId; ?></dd>
                    <dt>Beställningsdatum:</dt>
                    <dd class="dateToday"><?php echo $date_ordered_at; ?></dd>
                </dl>
            </div>

            <table>
                <thead class="font-bold">
                    <tr>
                        <th></th>
                        <th>Produkt</th>
                        <th>Antal</th>
                        <th>Pris</th>
                        <th class="item-total">Totalt</th>
                    </tr>
                </thead>
                <tbody class="order-list">
                    <?php echo $productListHtml; ?>
                </tbody>
            </table>
            <a href="index.php"><button class="btn btn-info goback-Btn"> &lt; Till Startsidan</button></a>

        </section>
    </main>

    <?php require_once __DIR__ . '/php/view/footer.php';?>

    <?php require __DIR__ . '/php/view/jscore.php';?>

</body>

</html>