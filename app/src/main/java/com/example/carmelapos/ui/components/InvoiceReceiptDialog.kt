package com.example.carmelapos.ui.components

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.carmelapos.data.model.Order
import com.example.carmelapos.data.model.OrderItem
import com.example.carmelapos.ui.theme.Emerald600
import com.example.carmelapos.ui.theme.Navy900
import com.example.carmelapos.ui.theme.Slate100
import com.example.carmelapos.ui.theme.Slate200
import com.example.carmelapos.ui.theme.Slate300
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun InvoiceReceiptDialog(
    order: Order,
    items: List<OrderItem>,
    onDismiss: () -> Unit
) {
    val dateStr = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.US).format(Date(order.timestamp))

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(4.dp)
                .testTag("invoice_receipt_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                // Header with checkmark
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Success",
                            tint = Emerald600,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "WHOLESALE INVOICE",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.sp
                                ),
                                color = Navy900
                            )
                            Text(
                                text = "Karma Carmela Food Supply",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                color = Color.Gray
                            )
                        }
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.testTag("close_invoice_btn")) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Invoice metadata box
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Slate100,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Invoice #: ${order.orderNumber}",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            )
                            Text(
                                text = dateStr,
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.Gray
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Customer: ${order.customerName}",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                        )
                        Text(
                            text = "Payment: ${order.paymentMethod.replace('_', ' ')} (${order.paymentStatus})",
                            style = MaterialTheme.typography.bodySmall.copy(color = Emerald600, fontWeight = FontWeight.Medium)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Line items list
                Text(
                    text = "Items Ordered (${items.size}):",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                )
                Spacer(modifier = Modifier.height(6.dp))

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f, fill = false)
                        .height(180.dp)
                ) {
                    items(items) { item ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = item.productName,
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                    modifier = Modifier.weight(1f)
                                )
                                Text(
                                    text = String.format(Locale.US, "$%.2f", item.lineTotal),
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${String.format(Locale.US, "%.1f", item.unitQuantity)} x ${item.unitName} @ $${String.format(Locale.US, "%.2f", item.unitPrice)}",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, color = Color.Gray)
                                )
                                Text(
                                    text = "(${String.format(Locale.US, "%.0f", item.totalBaseUnits)} base units)",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp, color = Color.Gray)
                                )
                            }
                            HorizontalDivider(modifier = Modifier.padding(top = 4.dp), color = Slate200)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Totals
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Slate100, RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Subtotal", style = MaterialTheme.typography.bodySmall)
                        Text(
                            String.format(Locale.US, "$%.2f", order.subtotal),
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace)
                        )
                    }
                    if (order.discountAmount > 0) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Discount (${order.discountPercent}%)", style = MaterialTheme.typography.bodySmall, color = Emerald600)
                            Text(
                                String.format(Locale.US, "-$%.2f", order.discountAmount),
                                style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace, color = Emerald600)
                            )
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            if (order.taxPercent > 0) "Tax (${order.taxPercent}%)" else "Wholesale Tax (Exempt)",
                            style = MaterialTheme.typography.bodySmall
                        )
                        Text(
                            String.format(Locale.US, "$%.2f", order.taxAmount),
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace)
                        )
                    }
                    HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp), color = Slate300)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Total Due",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            String.format(Locale.US, "$%.2f", order.totalAmount),
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Navy900,
                                fontFamily = FontFamily.Monospace
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(imageVector = Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Print / Share")
                    }

                    Button(
                        onClick = onDismiss,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("done_invoice_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = Navy900)
                    ) {
                        Text("Done", color = Color.White)
                    }
                }
            }
        }
    }
}
