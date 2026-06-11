import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../widgets/google_signin_button.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _loading = false;
  bool _isRegisterMode = false;
  int _loginStep = 1;
  final _authService = AuthService();
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

  void _showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.redAccent : Colors.green,
      ),
    );
  }

  Future<void> _submitLoginStep1() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      _showMessage('Ingresa un email', isError: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await _authService.loginStep1(email);
      _showMessage('Paso 1 correcto. Ahora ingresa tu contraseña.');
      setState(() => _loginStep = 2);
    } catch (e) {
      _showMessage('Error paso 1: $e', isError: true);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submitLoginStep2() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) {
      _showMessage('Email y contraseña son obligatorios', isError: true);
      return;
    }

    setState(() => _loading = true);
    try {
      final resp = await _authService.loginStep2(email, password);
      _showMessage('Login exitoso.');
      if (resp.containsKey('accessToken')) {
        await _authService.saveToken('accessToken', resp['accessToken'].toString());
      }
      if (resp.containsKey('refreshToken')) {
        await _authService.saveToken('refreshToken', resp['refreshToken'].toString());
      }
    } catch (e) {
      _showMessage('Error paso 2: $e', isError: true);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submitRegister() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (email.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
      _showMessage('Completa todos los campos', isError: true);
      return;
    }
    if (password != confirmPassword) {
      _showMessage('Las contraseñas no coinciden', isError: true);
      return;
    }

    setState(() => _loading = true);
    try {
      final resp = await _authService.register({'email': email, 'password': password});
      final message = resp['message'] ?? 'Registro solicitado';
      _showMessage(message.toString());
    } catch (e) {
      _showMessage('Error registro: $e', isError: true);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submitGoogleSignIn() async {
    setState(() => _loading = true);
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        _showMessage('Inicio de sesión con Google cancelado.', isError: true);
        return;
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        throw Exception('No se obtuvo idToken de Google');
      }
      final resp = await _authService.googleAuth(idToken);
      _showMessage('Google auth exitosa.');
      if (resp.containsKey('accessToken')) {
        await _authService.saveToken('accessToken', resp['accessToken'].toString());
      }
      if (resp.containsKey('refreshToken')) {
        await _authService.saveToken('refreshToken', resp['refreshToken'].toString());
      }
    } catch (e) {
      _showMessage('Error Google auth: $e', isError: true);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submitForgotPassword(String email) async {
    if (email.isEmpty) {
      _showMessage('Ingresa un email para recuperar contraseña', isError: true);
      return;
    }
    setState(() => _loading = true);
    try {
      final resp = await _authService.forgotPassword(email);
      final message = resp['message'] ?? 'Solicitud de recuperación enviada';
      _showMessage(message.toString());
    } catch (e) {
      _showMessage('Error recuperar contraseña: $e', isError: true);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _showForgotPasswordDialog() async {
    final controller = TextEditingController(text: _emailController.text.trim());
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Recuperar contraseña'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(labelText: 'Email'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _submitForgotPassword(controller.text.trim());
            },
            child: Text('Enviar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoginMode = !_isRegisterMode;
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            children: [
              SizedBox(height: 24),
              Text(
                'AsistenciaIIAP',
                style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: 0.2),
              ),
              SizedBox(height: 12),
              Container(
                width: 60,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              SizedBox(height: 32),
              Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: Color.fromRGBO(0, 0, 0, 0.05),
                      blurRadius: 24,
                      offset: Offset(0, 12),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isLoginMode ? 'Bienvenido de nuevo' : 'Crear cuenta',
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      isLoginMode
                          ? 'Accede a tu cuenta profesional de AsistenciaIIAP.'
                          : 'Únete a AsistenciaIIAP para gestionar tu infraestructura con eficiencia y total seguridad.',
                      style: TextStyle(color: Colors.grey[600], height: 1.5),
                    ),
                    SizedBox(height: 28),
                    _buildTextField(_emailController, 'Correo electrónico', Icons.email_outlined),
                    SizedBox(height: 16),
                    if (isLoginMode && _loginStep == 2)
                      _buildTextField(_passwordController, 'Contraseña', Icons.lock_outline, obscure: true),
                    if (isLoginMode && _loginStep == 2) SizedBox(height: 16),
                    if (!isLoginMode) ...[
                      _buildTextField(_passwordController, 'Contraseña', Icons.lock_outline, obscure: true),
                      SizedBox(height: 16),
                      _buildTextField(_confirmPasswordController, 'Confirmar contraseña', Icons.lock_outline, obscure: true),
                      SizedBox(height: 16),
                      Text(
                        'Mínimo 8 caracteres, incluye un número.',
                        style: TextStyle(color: Colors.grey[500], fontSize: 13),
                      ),
                      SizedBox(height: 16),
                    ],
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: _loading
                            ? null
                            : isLoginMode
                                ? (_loginStep == 1 ? _submitLoginStep1 : _submitLoginStep2)
                                : _submitRegister,
                        child: _loading
                            ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : Text(
                                isLoginMode
                                    ? (_loginStep == 1 ? 'Iniciar sesión' : 'Ingresar')
                                    : 'Crear cuenta',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                      ),
                    ),
                    if (isLoginMode && _loginStep == 2)
                      TextButton(
                        onPressed: _loading
                            ? null
                            : () {
                                setState(() {
                                  _loginStep = 1;
                                  _passwordController.clear();
                                });
                              },
                        child: Text('Volver a paso 1'),
                      ),
                    if (isLoginMode)
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: _loading ? null : _showForgotPasswordDialog,
                          child: Text('¿Olvidaste tu contraseña?'),
                        ),
                      ),
                  ],
                ),
              ),
              SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildBottomTab(
                      icon: Icons.login,
                      label: 'Sign In',
                      selected: isLoginMode,
                      onTap: () {
                        setState(() {
                          _isRegisterMode = false;
                          _loginStep = 1;
                          _passwordController.clear();
                          _confirmPasswordController.clear();
                        });
                      },
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildBottomTab(
                      icon: Icons.person_add,
                      label: 'Register',
                      selected: !isLoginMode,
                      onTap: () {
                        setState(() {
                          _isRegisterMode = true;
                          _loginStep = 1;
                          _passwordController.clear();
                          _confirmPasswordController.clear();
                        });
                      },
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24),
              Text('O CONTINÚA CON', style: TextStyle(color: Colors.grey[600], letterSpacing: 1.1)),
              SizedBox(height: 16),
              GoogleSignInButton(
                label: isLoginMode ? 'Loguearse con Google' : 'Registrarse con Google',
                onPressed: _loading ? null : _submitGoogleSignIn,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomTab({required IconData icon, required String label, required bool selected, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 62,
        decoration: BoxDecoration(
          color: selected ? Colors.blue.shade50 : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: selected ? Colors.blueAccent : Colors.grey.shade300),
        ),
        padding: EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: selected ? Colors.blueAccent : Colors.grey[600]),
            SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: selected ? Colors.blueAccent : Colors.grey[700],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {bool obscure = false}) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        filled: true,
        fillColor: Colors.grey[100],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
      ),
    );
  }
}
