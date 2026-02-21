<?php
// Reset last_reminder agar bot bisa kirim reminder hari ini
$conn = new mysqli("localhost", "root", "", "botreminder");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "🔄 Reset last_reminder agar bot bisa kirim hari ini...\n\n";

// Reset last_reminder ke NULL atau tanggal kemarin
$conn->query("UPDATE billing SET last_reminder = NULL");

echo "✅ last_reminder direset!\n\n";

// Show results
$result = $conn->query("
    SELECT client_name, service, amount, due_date, phone,
    DATEDIFF(due_date, CURDATE()) AS days_left,
    last_reminder, last_reminder_note
    FROM billing
");

echo "Current billing data (Today: 2026-02-11):\n";
echo str_repeat("-", 110) . "\n";
printf("%-10s %-10s %-12s %-12s %-15s %-10s %-15s %-15s\n", 
    "Client", "Service", "Amount", "Due Date", "Phone", "Days", "Last Reminder", "Note");
echo str_repeat("-", 110) . "\n";

while($row = $result->fetch_assoc()) {
    printf("%-10s %-10s %-12s %-12s %-15s %-10s %-15s %-15s\n", 
        $row["client_name"], 
        $row["service"], 
        number_format($row["amount"], 0, ',', '.'), 
        $row["due_date"],
        $row["phone"],
        $row["days_left"],
        $row["last_reminder"] ?? 'NULL',
        $row["last_reminder_note"] ?? '-'
    );
    
    // Show reminder type
    $diff = $row["days_left"];
    echo "    → ";
    if ($diff == 7) echo "Will send: H-7 reminder\n";
    else if ($diff == 3) echo "Will send: H-3 reminder ✅ (HARI INI)\n";
    else if ($diff == 1) echo "Will send: H-1 reminder ✅ (HARI INI)\n";
    else if ($diff == 0) echo "Will send: H0 reminder (today)\n";
    else if ($diff < 0) echo "Will send: OVERDUE reminder\n";
    else echo "No reminder scheduled\n";
}

echo "\n💡 Bot akan kirim reminder saat dijalankan karena last_reminder = NULL\n";

$conn->close();
?>
