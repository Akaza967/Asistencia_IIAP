import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(AsistenceApp());
}

class AsistenceApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Asistence Frontend',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: LoginScreen(),
    );
  }
}
