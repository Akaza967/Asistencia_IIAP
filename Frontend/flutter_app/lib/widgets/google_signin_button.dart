import 'package:flutter/material.dart';

class GoogleSignInButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final String label;

  const GoogleSignInButton({this.onPressed, this.label = 'Entrar con Google'});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      icon: Image.asset('assets/icons8-logo-de-google-48.png', width: 24, height: 24),
      label: Text(label),
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        minimumSize: Size(double.infinity, 52),
        side: BorderSide(color: Colors.grey.shade300),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }
}
