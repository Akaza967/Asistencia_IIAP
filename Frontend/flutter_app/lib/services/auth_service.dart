import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  final String baseUrl = 'https://revoke-dollop-propeller.ngrok-free.dev/api';

  Map<String, String> _defaultHeaders() => {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'ngrok-skip-browser-warning': '1',
      };

  Map<String, dynamic> _parseResponseBody(http.Response resp) {
    if (resp.body.isEmpty) return {};
    final decoded = jsonDecode(resp.body);
    return decoded is Map ? Map<String, dynamic>.from(decoded) : {'data': decoded};
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl/auth/register');
    final resp = await http.post(uri, headers: _defaultHeaders(), body: jsonEncode(body));
    final decoded = _parseResponseBody(resp);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded;
    } else {
      throw ApiException(resp.statusCode, decoded);
    }
  }

  /// Step 1 login: sends email
  /// Returns parsed JSON on success, throws Exception on non-200.
  Future<Map<String, dynamic>> loginStep1(String email) async {
    final uri = Uri.parse('$baseUrl/auth/login/step-1');
    final resp = await http.post(uri, headers: _defaultHeaders(), body: jsonEncode({'email': email}));
    final decoded = _parseResponseBody(resp);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded;
    } else {
      throw ApiException(resp.statusCode, decoded);
    }
  }

  Future<Map<String, dynamic>> loginStep2(String email, String password) async {
    final uri = Uri.parse('$baseUrl/auth/login/step-2');
    final resp = await http.post(uri, headers: _defaultHeaders(), body: jsonEncode({'email': email, 'password': password}));
    final decoded = _parseResponseBody(resp);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded;
    } else {
      throw ApiException(resp.statusCode, decoded);
    }
  }

  Future<Map<String, dynamic>> googleAuth(String idToken) async {
    final uri = Uri.parse('$baseUrl/auth/google');
    final resp = await http.post(uri, headers: _defaultHeaders(), body: jsonEncode({'idToken': idToken}));
    final decoded = _parseResponseBody(resp);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded;
    } else {
      throw ApiException(resp.statusCode, decoded);
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final uri = Uri.parse('$baseUrl/auth/forgot-password');
    final resp = await http.post(uri, headers: _defaultHeaders(), body: jsonEncode({'email': email}));
    final decoded = _parseResponseBody(resp);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded;
    } else {
      throw ApiException(resp.statusCode, decoded);
    }
  }

  Future<Map<String, dynamic>> resetPassword(String token, String newPassword) async {
    final uri = Uri.parse('$baseUrl/auth/reset-password');
    final resp = await http.post(uri, headers: _defaultHeaders(), body: jsonEncode({'token': token, 'newPassword': newPassword}));
    final decoded = _parseResponseBody(resp);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded;
    } else {
      throw ApiException(resp.statusCode, decoded);
    }
  }

  Future<void> saveToken(String key, String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, token);
  }

  Future<String?> readToken(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }
}

class ApiException implements Exception {
  final int statusCode;
  final dynamic body;
  ApiException(this.statusCode, this.body);

  @override
  String toString() => 'ApiException(statusCode: \$statusCode, body: \$body)';
}
