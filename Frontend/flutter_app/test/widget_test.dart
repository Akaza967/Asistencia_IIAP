import 'package:flutter_test/flutter_test.dart';

import 'package:asistence_frontend/main.dart';

void main() {
  testWidgets('App starts with SplashScreen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(AsistenciaIIAPApp());

    // Verify that the splash screen text is present.
    expect(find.text('ASISTENCIA IIAP'), findsOneWidget);
    expect(find.text('Instituto de Investigaciones de la Amazonía Peruana'), findsOneWidget);
  });
}
