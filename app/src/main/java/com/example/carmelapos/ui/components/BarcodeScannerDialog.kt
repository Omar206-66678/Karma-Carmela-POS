package com.example.carmelapos.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.carmelapos.ui.theme.Amber500
import com.example.carmelapos.ui.theme.Emerald500
import com.example.carmelapos.ui.theme.Navy900
import com.example.carmelapos.ui.theme.Rose500

@Composable
fun BarcodeScannerDialog(
    onDismiss: () -> Unit,
    onBarcodeScanned: (String) -> Unit
) {
    var manualBarcode by remember { mutableStateOf("") }
    var continuousMode by remember { mutableStateOf(false) }

    val infiniteTransition = rememberInfiniteTransition(label = "scanner_laser")
    val laserOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "laser_y"
    )

    val quickWholesaleBarcodes = listOf(
        Pair("Case Olive Oil", "800123456718"),
        Pair("Master Carton Oil", "800123456749"),
        Pair("Case San Marzano", "800234567819"),
        Pair("Pallet Tomatoes", "800234567857"),
        Pair("Caputo Flour 25kg", "800345678903"),
        Pair("Parmigiano Wheel", "800456789004"),
        Pair("Case Oat Milk", "800567890112"),
        Pair("Balsamic Jug 5L", "800678901206"),
        Pair("Rigatoni Box 20kg", "800789012314")
    )

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("barcode_scanner_dialog"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Navy900)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Amber500.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.QrCodeScanner,
                                contentDescription = "Scanner",
                                tint = Amber500,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Barcode Scanner",
                            style = MaterialTheme.typography.titleMedium.copy(color = Color.White)
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.testTag("close_scanner_btn")) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.White.copy(alpha = 0.7f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Viewfinder simulation
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF020617))
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    // Corner targeting brackets
                    Box(
                        modifier = Modifier
                            .size(150.dp, 110.dp)
                            .border(2.dp, Amber500.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                    )

                    // Laser scan animation line
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.7f)
                            .height(2.dp)
                            .background(Rose500)
                            .align(Alignment.TopCenter)
                            .padding(top = (180 * laserOffset * 0.75f).dp)
                    )

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.FlashOn,
                            contentDescription = null,
                            tint = Amber500.copy(alpha = 0.5f),
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Point camera at item or box barcode",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Color.White.copy(alpha = 0.6f),
                                fontSize = 11.sp
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Quick Wholesale Presets (for instant scanning testing)
                Text(
                    text = "Quick Wholesale Barcodes:",
                    style = MaterialTheme.typography.labelMedium.copy(color = Color.White.copy(alpha = 0.7f)),
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(quickWholesaleBarcodes) { (label, code) ->
                        FilterChip(
                            selected = false,
                            onClick = {
                                onBarcodeScanned(code)
                                if (!continuousMode) onDismiss()
                            },
                            label = {
                                Text(
                                    label,
                                    fontSize = 11.sp,
                                    color = Color.White
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp),
                                    tint = Emerald500
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Manual Input
                OutlinedTextField(
                    value = manualBarcode,
                    onValueChange = { manualBarcode = it },
                    label = { Text("Or enter barcode / SKU manually", color = Color.White.copy(alpha = 0.7f)) },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("manual_barcode_input"),
                    textStyle = MaterialTheme.typography.bodyMedium.copy(
                        color = Color.White,
                        fontFamily = FontFamily.Monospace
                    ),
                    trailingIcon = {
                        if (manualBarcode.isNotBlank()) {
                            IconButton(
                                onClick = {
                                    onBarcodeScanned(manualBarcode)
                                    if (!continuousMode) onDismiss()
                                },
                                modifier = Modifier.testTag("submit_manual_barcode_btn")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Search,
                                    contentDescription = "Search",
                                    tint = Emerald500
                                )
                            }
                        }
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = { continuousMode = !continuousMode }) {
                        Text(
                            text = if (continuousMode) "● Continuous Scan ON" else "Continuous Scan OFF",
                            color = if (continuousMode) Emerald500 else Color.White.copy(alpha = 0.6f),
                            fontSize = 12.sp
                        )
                    }

                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155))
                    ) {
                        Text("Done", color = Color.White)
                    }
                }
            }
        }
    }
}
