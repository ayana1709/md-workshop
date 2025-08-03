<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f4f4f4; }
        h1 { text-align: center; }
    </style>
</head>
<body>
    <h1>Customer Report</h1>
    <p><strong>Name:</strong> {{ $customer->name }}</p>
    <p><strong>Telephone:</strong> {{ $customer->telephone }}</p>

    <h2>Car Details</h2>
    <table>
        <thead>
            <tr>
                <th>Car Model</th>
                <th>Plate Number</th>
                <th>Car Status</th>
                <th>Payment Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($customer->carModel as $car)
                <tr>
                    <td>{{ $car->car_model }}</td>
                    <td>{{ $car->plate_no }}</td>
                    <td>{{ $car->car_status }}</td>
                    <td>{{ $car->payment_status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
