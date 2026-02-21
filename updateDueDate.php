<?php
// Update database untuk testing reminder hari ini
// Hari ini: 2026-02-11

$conn = new mysqli("localhost", "root", "", "botreminder");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "🗑️ Menghapus data Aqila dan Nafa...\n";
$conn->query("DELETE FROM billing WHERE client_name IN ('Aqila', 'Nafa')");

echo "📅 Update due_date agar reminder bisa kirim hari ini...\n\n";

// Update Fahri - H-3 (due date 3 hari dari sekarang = 14 Feb)
$conn->query("UPDATE billing SET due_date = '2026-02-14' WHERE client_name = 'fahri'");

// Update Radit - H-1 (due date 1 hari dari sekarang = 12 Feb)  
$conn->query("UPDATE billing SET due_date = '2026-02-12' WHERE client_name = 'radit'");

echo "✅ Database updated!\n\n";

// Show results
$result = $conn->query("
    SELECT client_name, service, amount, due_date, phone,
    DATEDIFF(due_date, CURDATE()) AS days_left 
    FROM billing
");

echo "Current billing data (Today: 2026-02-11):\n";
echo str_repeat("-", 90) . "\n";
printf("%-15s %-15s %-15s %-15s %-15s %-10s\n", "Client", "Service", "Amount", "Due Date", "Phone", "Days Left");
echo str_repeat("-", 90) . "\n";

while($row = $result->fetch_assoc()) {
    printf("%-15s %-15s %-15s %-15s %-15s %-10s\n", 
        $row["client_name"], 
        $row["service"], 
        $row["amount"], 
        $row["due_date"],
        $row["phone"],
        $row["days_left"]
    );
    
    // Show reminder type
    $diff = $row["days_left"];
    if ($diff == 7) echo "    → Will send: H-7 reminder\n";
    if ($diff == 3) echo "    → Will send: H-3 reminder ✅\n";
    if ($diff == 1) echo "    → Will send: H-1 reminder ✅\n";
    if ($diff == 0) echo "    → Will send: H0 reminder (today)\n";
    if ($diff < 0) echo "    → Will send: OVERDUE reminder\n";
}

$conn->close();
?>
