import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(AsistenciaIIAPApp());
}

class AsistenciaIIAPApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AsistenciaIIAP',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.grey[50],
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: LoginScreen(),
    );
  }
}
