# Freight Broker Management Application
## Complete Android Architecture & Development Specification

---

# 1. SYSTEM ARCHITECTURE

## 1.1 Overall Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Activity  │  │  Fragments  │  │    View Models          │ │
│  │   & Views   │  │  & Layouts  │  │  (MVVM Pattern)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Use Cases │  │  Repository │  │    Domain Models        │ │
│  │  (Interact.)│  │  Interfaces │  │    & Entities           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │    Room     │  │  Shared     │  │   File Storage          │ │
│  │   Database  │  │ Preferences │  │   (Attachments)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Phone   │ │ WhatsApp │ │ PhonePe │ │  Google  │ │  Drive  │ │
│  │ Intents │ │  Intent  │ │   UPI   │ │   Maps   │ │  Backup │ │
│  └─────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Language | Kotlin 1.9+ | Primary development language |
| Min SDK | Android 11 (API 30) | Target platform |
| Architecture | MVVM + Clean Architecture | Separation of concerns |
| DI | Hilt | Dependency injection |
| Database | Room | Local SQLite ORM |
| Async | Coroutines + Flow | Asynchronous operations |
| Navigation | Jetpack Navigation Component | Screen navigation |
| UI Components | Material Design 3 | UI components |
| Image Loading | Coil | Image loading & caching |
| PDF Viewing | Android PdfRenderer | PDF display |
| Backup | Google Drive API | Cloud backup |
| JSON | Kotlinx Serialization | Data serialization |

## 1.3 Module Structure

```
app/
├── data/
│   ├── local/
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   ├── dao/
│   │   │   └── FreightDatabase.kt
│   │   └── preferences/
│   ├── repository/
│   └── mapper/
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
├── presentation/
│   ├── dashboard/
│   ├── loads/
│   ├── history/
│   ├── contacts/
│   ├── trucks/
│   ├── notes/
│   ├── attachments/
│   └── settings/
├── di/
│   ├── DatabaseModule.kt
│   ├── RepositoryModule.kt
│   └── UseCaseModule.kt
└── util/
    ├── intents/
    ├── formatting/
    └── extensions/
```

---

# 2. DATABASE SCHEMA

## 2.1 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│     FREIGHT      │       │      TRUCK       │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ truck_id (FK)    │──────▶│ truck_number     │
│ pickup_location  │       │ last_four_digits │
│ drop_location    │       │ notes            │
│ distance_km      │       │ created_at       │
│ weight           │       │ updated_at       │
│ weight_type      │       └──────────────────┘
│ driver_freight   │              │
│ broker_freight   │              │
│ freight_type     │              ▼
│ status           │       ┌──────────────────┐
│ created_at       │       │  TRUCK_NOTE      │
│ updated_at       │       ├──────────────────┤
│ completed_at     │       │ id (PK)          │
└──────────────────┘       │ truck_id (FK)    │
         │                 │ tag              │
         │                 │ description      │
         │                 │ created_at       │
         │                 └──────────────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│ FREIGHT_CONTACT  │       │     CONTACT      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ freight_id (FK)  │       │ name             │
│ contact_id (FK)  │──────▶│ phone_number     │
│ role             │       │ alt_phone        │
└──────────────────┘       │ is_imported      │
                           │ created_at       │
                           └──────────────────┘
                                   │
                                   ▼
                           ┌──────────────────┐
                           │  CONTACT_TAG     │
                           ├──────────────────┤
                           │ id (PK)          │
                           │ contact_id (FK)  │
                           │ tag_name         │
                           │ is_custom        │
                           └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│   EXTRA_CHARGE   │       │       NOTE       │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ freight_id (FK)  │       │ freight_id (FK)  │
│ charge_type      │       │ tag              │
│ amount           │       │ description      │
│ notes            │       │ created_at       │
│ created_at       │       └──────────────────┘
└──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│    ATTACHMENT    │       │     PAYMENT      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ freight_id (FK)  │       │ freight_id (FK)  │
│ file_name        │       │ payment_type     │
│ file_path        │       │ amount           │
│ file_type        │       │ direction        │
│ file_size        │       │ status           │
│ mime_type        │       │ payment_date     │
│ created_at       │       │ notes            │
└──────────────────┘       │ created_at       │
                           └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│      TAG         │       │  SEARCH_INDEX    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ name             │       │ entity_type      │
│ category         │       │ entity_id (FK)   │
│ color_code       │       │ search_text      │
│ is_custom        │       │ created_at       │
│ created_at       │       └──────────────────┘
└──────────────────┘
```

## 2.2 Room Database Entities

### FreightEntity.kt

```kotlin
@Entity(tableName = "freights")
data class FreightEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    val truckId: Long,
    
    @ColumnInfo(name = "pickup_location")
    val pickupLocation: String,
    
    @ColumnInfo(name = "drop_location")
    val dropLocation: String,
    
    @ColumnInfo(name = "distance_km")
    val distanceKm: Double?,
    
    val weight: Double,
    
    @ColumnInfo(name = "weight_type")
    val weightType: WeightType,
    
    @ColumnInfo(name = "driver_freight")
    val driverFreight: Double,
    
    @ColumnInfo(name = "broker_freight")
    val brokerFreight: Double,
    
    @ColumnInfo(name = "freight_type")
    val freightType: FreightType,
    
    val status: FreightStatus,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "completed_at")
    val completedAt: Long? = null,
    
    @ColumnInfo(name = "pickup_date")
    val pickupDate: Long? = null,
    
    @ColumnInfo(name = "delivery_date")
    val deliveryDate: Long? = null
)

enum class WeightType {
    TON, CHAKKA
}

enum class FreightType {
    FIXED, PER_TON
}

enum class FreightStatus {
    ACTIVE, COMPLETED, PROBLEM, CANCELLED
}
```

### TruckEntity.kt

```kotlin
@Entity(tableName = "trucks")
data class TruckEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "truck_number")
    val truckNumber: String,
    
    @ColumnInfo(name = "last_four_digits")
    val lastFourDigits: String,
    
    val notes: String? = null,
    
    @ColumnInfo(name = "total_trips")
    val totalTrips: Int = 0,
    
    @ColumnInfo(name = "has_problems")
    val hasProblems: Boolean = false,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
```

### ContactEntity.kt

```kotlin
@Entity(tableName = "contacts")
data class ContactEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    val name: String,
    
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,
    
    @ColumnInfo(name = "alt_phone")
    val altPhone: String? = null,
    
    @ColumnInfo(name = "is_imported")
    val isImported: Boolean = false,
    
    @ColumnInfo(name = "contact_id_uri")
    val contactIdUri: String? = null, // For linking to phone contacts
    
    val notes: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
```

### FreightContactEntity.kt (Junction Table)

```kotlin
@Entity(
    tableName = "freight_contacts",
    foreignKeys = [
        ForeignKey(
            entity = FreightEntity::class,
            parentColumns = ["id"],
            childColumns = ["freight_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = ContactEntity::class,
            parentColumns = ["id"],
            childColumns = ["contact_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("freight_id"), Index("contact_id")]
)
data class FreightContactEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "freight_id")
    val freightId: Long,
    
    @ColumnInfo(name = "contact_id")
    val contactId: Long,
    
    val role: ContactRole
)

enum class ContactRole {
    DRIVER, OWNER, PRODUCT_OWNER, SECOND_DRIVER, PAYMENT_PERSON, OTHER
}
```

### NoteEntity.kt

```kotlin
@Entity(
    tableName = "notes",
    foreignKeys = [
        ForeignKey(
            entity = FreightEntity::class,
            parentColumns = ["id"],
            childColumns = ["freight_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("freight_id")]
)
data class NoteEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "freight_id")
    val freightId: Long,
    
    val tag: String,
    
    val description: String,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
```

### TruckNoteEntity.kt

```kotlin
@Entity(
    tableName = "truck_notes",
    foreignKeys = [
        ForeignKey(
            entity = TruckEntity::class,
            parentColumns = ["id"],
            childColumns = ["truck_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("truck_id")]
)
data class TruckNoteEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "truck_id")
    val truckId: Long,
    
    val tag: String,
    
    val description: String,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
```

### ExtraChargeEntity.kt

```kotlin
@Entity(
    tableName = "extra_charges",
    foreignKeys = [
        ForeignKey(
            entity = FreightEntity::class,
            parentColumns = ["id"],
            childColumns = ["freight_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("freight_id")]
)
data class ExtraChargeEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "freight_id")
    val freightId: Long,
    
    @ColumnInfo(name = "charge_type")
    val chargeType: String,
    
    val amount: Double,
    
    val notes: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
```

### PaymentEntity.kt

```kotlin
@Entity(
    tableName = "payments",
    foreignKeys = [
        ForeignKey(
            entity = FreightEntity::class,
            parentColumns = ["id"],
            childColumns = ["freight_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("freight_id")]
)
data class PaymentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "freight_id")
    val freightId: Long,
    
    @ColumnInfo(name = "payment_type")
    val paymentType: PaymentType,
    
    val amount: Double,
    
    val direction: PaymentDirection,
    
    val status: PaymentStatus,
    
    @ColumnInfo(name = "payment_date")
    val paymentDate: Long? = null,
    
    val notes: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)

enum class PaymentType {
    BROKER_FREIGHT, DRIVER_FREIGHT, EXTRA_CHARGE
}

enum class PaymentDirection {
    INCOMING, OUTGOING
}

enum class PaymentStatus {
    PENDING, PARTIAL, COMPLETED
}
```

### AttachmentEntity.kt

```kotlin
@Entity(
    tableName = "attachments",
    foreignKeys = [
        ForeignKey(
            entity = FreightEntity::class,
            parentColumns = ["id"],
            childColumns = ["freight_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("freight_id")]
)
data class AttachmentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "freight_id")
    val freightId: Long,
    
    @ColumnInfo(name = "file_name")
    val fileName: String,
    
    @ColumnInfo(name = "file_path")
    val filePath: String,
    
    @ColumnInfo(name = "file_type")
    val fileType: FileType,
    
    @ColumnInfo(name = "file_size")
    val fileSize: Long,
    
    @ColumnInfo(name = "mime_type")
    val mimeType: String,
    
    @ColumnInfo(name = "thumbnail_path")
    val thumbnailPath: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)

enum class FileType {
    IMAGE, PDF, DOCUMENT, OTHER
}
```

### TagEntity.kt

```kotlin
@Entity(tableName = "tags")
data class TagEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    val name: String,
    
    val category: TagCategory,
    
    @ColumnInfo(name = "color_code")
    val colorCode: String = "#FF7A00", // Default orange
    
    @ColumnInfo(name = "is_custom")
    val isCustom: Boolean = false,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)

enum class TagCategory {
    NOTE, CHARGE, CONTACT, TRUCK
}
```

### SearchIndexEntity.kt

```kotlin
@Entity(tableName = "search_index")
data class SearchIndexEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    @ColumnInfo(name = "entity_type")
    val entityType: SearchEntityType,
    
    @ColumnInfo(name = "entity_id")
    val entityId: Long,
    
    @ColumnInfo(name = "search_text")
    val searchText: String,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)

enum class SearchEntityType {
    FREIGHT, TRUCK, CONTACT, NOTE
}
```

## 2.3 DAO Interfaces

### FreightDao.kt

```kotlin
@Dao
interface FreightDao {
    
    @Query("SELECT * FROM freights WHERE status = :status ORDER BY created_at DESC")
    fun getFreightsByStatus(status: FreightStatus): Flow<List<FreightEntity>>
    
    @Query("SELECT * FROM freights WHERE status IN ('ACTIVE', 'PROBLEM') ORDER BY created_at DESC")
    fun getActiveFreights(): Flow<List<FreightEntity>>
    
    @Query("SELECT * FROM freights WHERE status = 'COMPLETED' ORDER BY completed_at DESC")
    fun getHistoryFreights(): Flow<List<FreightEntity>>
    
    @Query("""
        SELECT * FROM freights 
        WHERE created_at >= :startOfMonth AND created_at <= :endOfMonth
        AND status = 'COMPLETED'
    """)
    suspend fun getCompletedThisMonth(startOfMonth: Long, endOfMonth: Long): List<FreightEntity>
    
    @Query("SELECT * FROM freights WHERE id = :id")
    suspend fun getFreightById(id: Long): FreightEntity?
    
    @Query("SELECT * FROM freights WHERE truck_id = :truckId ORDER BY created_at DESC")
    fun getFreightsByTruck(truckId: Long): Flow<List<FreightEntity>>
    
    @Query("""
        SELECT COUNT(*) FROM freights 
        WHERE status IN ('ACTIVE', 'PROBLEM')
    """)
    fun getActiveCount(): Flow<Int>
    
    @Query("SELECT COUNT(*) FROM freights WHERE status = 'PROBLEM'")
    fun getProblemCount(): Flow<Int>
    
    @Query("""
        SELECT SUM(broker_freight) FROM freights 
        WHERE created_at >= :startOfMonth AND created_at <= :endOfMonth
        AND status = 'COMPLETED'
    """)
    suspend fun getTotalBrokerFreightThisMonth(startOfMonth: Long, endOfMonth: Long): Double?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFreight(freight: FreightEntity): Long
    
    @Update
    suspend fun updateFreight(freight: FreightEntity)
    
    @Delete
    suspend fun deleteFreight(freight: FreightEntity)
    
    @Query("UPDATE freights SET status = :status, completed_at = :completedAt WHERE id = :id")
    suspend fun updateStatus(id: Long, status: FreightStatus, completedAt: Long?)
    
    @Transaction
    @Query("SELECT * FROM freights WHERE id = :id")
    suspend fun getFreightWithDetails(id: Long): FreightWithDetails?
}

data class FreightWithDetails(
    @Embedded val freight: FreightEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "freight_id"
    )
    val contacts: List<FreightContactWithContact>,
    @Relation(
        parentColumn = "id",
        entityColumn = "freight_id"
    )
    val notes: List<NoteEntity>,
    @Relation(
        parentColumn = "id",
        entityColumn = "freight_id"
    )
    val extraCharges: List<ExtraChargeEntity>,
    @Relation(
        parentColumn = "id",
        entityColumn = "freight_id"
    )
    val payments: List<PaymentEntity>,
    @Relation(
        parentColumn = "id",
        entityColumn = "freight_id"
    )
    val attachments: List<AttachmentEntity>
)
```

### TruckDao.kt

```kotlin
@Dao
interface TruckDao {
    
    @Query("SELECT * FROM trucks ORDER BY updated_at DESC")
    fun getAllTrucks(): Flow<List<TruckEntity>>
    
    @Query("SELECT * FROM trucks WHERE id = :id")
    suspend fun getTruckById(id: Long): TruckEntity?
    
    @Query("SELECT * FROM trucks WHERE truck_number LIKE '%' || :query || '%'")
    suspend fun searchTrucks(query: String): List<TruckEntity>
    
    @Query("SELECT * FROM trucks WHERE last_four_digits = :lastFour")
    suspend fun findByLastFourDigits(lastFour: String): List<TruckEntity>
    
    @Query("SELECT * FROM trucks WHERE truck_number = :truckNumber")
    suspend fun findByTruckNumber(truckNumber: String): TruckEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTruck(truck: TruckEntity): Long
    
    @Update
    suspend fun updateTruck(truck: TruckEntity)
    
    @Delete
    suspend fun deleteTruck(truck: TruckEntity)
    
    @Transaction
    @Query("SELECT * FROM trucks WHERE id = :id")
    suspend fun getTruckWithHistory(id: Long): TruckWithHistory?
}

data class TruckWithHistory(
    @Embedded val truck: TruckEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "truck_id"
    )
    val notes: List<TruckNoteEntity>,
    @Relation(
        parentColumn = "id",
        entityColumn = "truck_id"
    )
    val freights: List<FreightEntity>
)
```

### ContactDao.kt

```kotlin
@Dao
interface ContactDao {
    
    @Query("SELECT * FROM contacts ORDER BY name ASC")
    fun getAllContacts(): Flow<List<ContactEntity>>
    
    @Query("SELECT * FROM contacts WHERE id = :id")
    suspend fun getContactById(id: Long): ContactEntity?
    
    @Query("""
        SELECT * FROM contacts 
        WHERE name LIKE '%' || :query || '%' 
        OR phone_number LIKE '%' || :query || '%'
        OR alt_phone LIKE '%' || :query || '%'
    """)
    suspend fun searchContacts(query: String): List<ContactEntity>
    
    @Query("""
        SELECT c.* FROM contacts c
        INNER JOIN freight_contacts fc ON c.id = fc.contact_id
        WHERE fc.freight_id = :freightId
    """)
    suspend fun getContactsByFreight(freightId: Long): List<ContactEntity>
    
    @Query("""
        SELECT c.* FROM contacts c
        INNER JOIN freight_contacts fc ON c.id = fc.contact_id
        INNER JOIN freights f ON fc.freight_id = f.id
        WHERE f.truck_id = :truckId
        GROUP BY c.id
    """)
    suspend fun getContactsByTruck(truckId: Long): List<ContactEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContact(contact: ContactEntity): Long
    
    @Update
    suspend fun updateContact(contact: ContactEntity)
    
    @Delete
    suspend fun deleteContact(contact: ContactEntity)
}
```

### PaymentDao.kt

```kotlin
@Dao
interface PaymentDao {
    
    @Query("SELECT * FROM payments WHERE freight_id = :freightId")
    suspend fun getPaymentsByFreight(freightId: Long): List<PaymentEntity>
    
    @Query("""
        SELECT SUM(amount) FROM payments 
        WHERE freight_id = :freightId 
        AND payment_type = 'BROKER_FREIGHT' 
        AND direction = 'INCOMING' 
        AND status != 'PENDING'
    """)
    suspend fun getBrokerPaidAmount(freightId: Long): Double?
    
    @Query("""
        SELECT SUM(amount) FROM payments 
        WHERE freight_id = :freightId 
        AND payment_type = 'DRIVER_FREIGHT' 
        AND direction = 'OUTGOING' 
        AND status != 'PENDING'
    """)
    suspend fun getDriverPaidAmount(freightId: Long): Double?
    
    @Query("""
        SELECT SUM(amount) FROM payments 
        WHERE direction = 'OUTGOING' 
        AND status = 'PENDING'
    """)
    suspend fun getTotalPendingDriverPayments(): Double?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayment(payment: PaymentEntity): Long
    
    @Update
    suspend fun updatePayment(payment: PaymentEntity)
    
    @Delete
    suspend fun deletePayment(payment: PaymentEntity)
}
```

### SearchIndexDao.kt

```kotlin
@Dao
interface SearchIndexDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIndex(index: SearchIndexEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIndices(indices: List<SearchIndexEntity>)
    
    @Query("""
        SELECT DISTINCT entity_type, entity_id FROM search_index 
        WHERE search_text LIKE '%' || :query || '%'
    """)
    suspend fun search(query: String): List<SearchResult>
    
    @Query("DELETE FROM search_index WHERE entity_type = :type AND entity_id = :id")
    suspend fun deleteIndex(type: SearchEntityType, id: Long)
    
    @Query("DELETE FROM search_index WHERE entity_id = :id")
    suspend fun deleteAllIndicesForEntity(id: Long)
}

data class SearchResult(
    val entity_type: SearchEntityType,
    val entity_id: Long
)
```

---

# 3. ANDROID UI STRUCTURE

## 3.1 Navigation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN ACTIVITY                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              NAV HOST FRAGMENT                        │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │           DASHBOARD SCREEN              │   │ │ │
│  │  │  │  • Active Loads Summary                 │   │ │ │
│  │  │  │  • Monthly Stats                       │   │ │ │
│  │  │  │  • Quick Actions                       │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │         RECENT LOADS SCREEN             │   │ │ │
│  │  │  │  • Active Freight Cards                │   │ │ │
│  │  │  │  • Swipe Actions                       │   │ │ │
│  │  │  │  • Quick Call/WhatsApp/PhonePe         │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │           HISTORY SCREEN                │   │ │ │
│  │  │  │  • Completed Freights                  │   │ │ │
│  │  │  │  • Search & Filter                     │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │          CONTACTS SCREEN                │   │ │ │
│  │  │  │  • Contact Directory                   │   │ │ │
│  │  │  │  • Import from Phone                   │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │           TRUCKS SCREEN                 │   │ │ │
│  │  │  │  • Truck Directory                     │   │ │ │
│  │  │  │  • History & Notes                     │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │           SETTINGS SCREEN               │   │ │ │
│  │  │  │  • Backup Options                      │   │ │ │
│  │  │  │  • Export Options                      │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  │                                                 │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │              BOTTOM NAV BAR                     │ │ │
│  │  │  [Dashboard] [Loads] [History] [More]           │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                    │
                    ▼ (Detail Navigation)

┌─────────────────────────────────────────────────────────────┐
│                    DETAIL SCREENS                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              FREIGHT DETAIL SCREEN                  │   │
│  │  • Full freight information                        │   │
│  │  • Contacts with actions                           │   │
│  │  • Payment tracking                                │   │
│  │  • Notes & Issues                                  │   │
│  │  • Attachments                                     │   │
│  │  • Extra charges                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           CREATE/EDIT FREIGHT SCREEN                │   │
│  │  • Form with all fields                            │   │
│  │  • Auto-suggestions                                │   │
│  │  • Contact assignment                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            CONTACT DETAIL SCREEN                    │   │
│  │  • Contact info                                    │   │
│  │  • Associated trucks                               │   │
│  │  • Freight history                                 │   │
│  │  • Payment history                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TRUCK DETAIL SCREEN                    │   │
│  │  • Truck info                                      │   │
│  │  • Associated drivers                              │   │
│  │  • Freight history                                 │   │
│  │  • Problem history                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            ATTACHMENT VIEWER SCREEN                 │   │
│  │  • Image viewer                                    │   │
│  │  • PDF viewer                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Navigation Graph

```kotlin
// nav_graph.xml
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/main_nav_graph"
    app:startDestination="@id/dashboardFragment">

    <!-- Main Tabs -->
    <fragment
        android:id="@+id/dashboardFragment"
        android:name="com.freightbroker.app.presentation.dashboard.DashboardFragment"
        android:label="Dashboard">
        <action
            android:id="@+id/action_dashboard_to_freight_detail"
            app:destination="@id/freightDetailFragment" />
        <action
            android:id="@+id/action_dashboard_to_create_freight"
            app:destination="@id/createFreightFragment" />
    </fragment>

    <fragment
        android:id="@+id/recentLoadsFragment"
        android:name="com.freightbroker.app.presentation.loads.RecentLoadsFragment"
        android:label="Recent Loads">
        <action
            android:id="@+id/action_loads_to_freight_detail"
            app:destination="@id/freightDetailFragment" />
        <action
            android:id="@+id/action_loads_to_create_freight"
            app:destination="@id/createFreightFragment" />
    </fragment>

    <fragment
        android:id="@+id/historyFragment"
        android:name="com.freightbroker.app.presentation.history.HistoryFragment"
        android:label="History">
        <action
            android:id="@+id/action_history_to_freight_detail"
            app:destination="@id/freightDetailFragment" />
    </fragment>

    <fragment
        android:id="@+id/moreFragment"
        android:name="com.freightbroker.app.presentation.more.MoreFragment"
        android:label="More">
        <action
            android:id="@+id/action_more_to_contacts"
            app:destination="@id/contactsFragment" />
        <action
            android:id="@+id/action_more_to_trucks"
            app:destination="@id/trucksFragment" />
        <action
            android:id="@+id/action_more_to_settings"
            app:destination="@id/settingsFragment" />
    </fragment>

    <!-- Detail Screens -->
    <fragment
        android:id="@+id/freightDetailFragment"
        android:name="com.freightbroker.app.presentation.detail.FreightDetailFragment"
        android:label="Freight Detail">
        <argument
            android:name="freightId"
            app:argType="long" />
        <action
            android:id="@+id/action_detail_to_edit"
            app:destination="@id/createFreightFragment" />
        <action
            android:id="@+id/action_detail_to_attachment"
            app:destination="@id/attachmentViewerFragment" />
    </fragment>

    <fragment
        android:id="@+id/createFreightFragment"
        android:name="com.freightbroker.app.presentation.create.CreateFreightFragment"
        android:label="Create Freight">
        <argument
            android:name="freightId"
            app:argType="long"
            android:defaultValue="-1L" />
        <argument
            android:name="duplicateFromId"
            app:argType="long"
            android:defaultValue="-1L" />
    </fragment>

    <fragment
        android:id="@+id/contactsFragment"
        android:name="com.freightbroker.app.presentation.contacts.ContactsFragment"
        android:label="Contacts">
        <action
            android:id="@+id/action_contacts_to_detail"
            app:destination="@id/contactDetailFragment" />
    </fragment>

    <fragment
        android:id="@+id/contactDetailFragment"
        android:name="com.freightbroker.app.presentation.contacts.ContactDetailFragment"
        android:label="Contact Detail">
        <argument
            android:name="contactId"
            app:argType="long" />
    </fragment>

    <fragment
        android:id="@+id/trucksFragment"
        android:name="com.freightbroker.app.presentation.trucks.TrucksFragment"
        android:label="Trucks">
        <action
            android:id="@+id/action_trucks_to_detail"
            app:destination="@id/truckDetailFragment" />
    </fragment>

    <fragment
        android:id="@+id/truckDetailFragment"
        android:name="com.freightbroker.app.presentation.trucks.TruckDetailFragment"
        android:label="Truck Detail">
        <argument
            android:name="truckId"
            app:argType="long" />
    </fragment>

    <fragment
        android:id="@+id/settingsFragment"
        android:name="com.freightbroker.app.presentation.settings.SettingsFragment"
        android:label="Settings" />

    <fragment
        android:id="@+id/attachmentViewerFragment"
        android:name="com.freightbroker.app.presentation.attachments.AttachmentViewerFragment"
        android:label="Attachment">
        <argument
            android:name="attachmentId"
            app:argType="long" />
    </fragment>

    <!-- Dialogs -->
    <dialog
        android:id="@+id/noteDialog"
        android:name="com.freightbroker.app.presentation.dialogs.NoteDialogFragment">
        <argument
            android:name="freightId"
            app:argType="long" />
    </dialog>

    <dialog
        android:id="@+id/extraChargeDialog"
        android:name="com.freightbroker.app.presentation.dialogs.ExtraChargeDialogFragment">
        <argument
            android:name="freightId"
            app:argType="long" />
    </dialog>

    <dialog
        android:id="@+id/paymentDialog"
        android:name="com.freightbroker.app.presentation.dialogs.PaymentDialogFragment">
        <argument
            android:name="freightId"
            app:argType="long" />
    </dialog>

    <dialog
        android:id="@+id/contactPickerDialog"
        android:name="com.freightbroker.app.presentation.dialogs.ContactPickerDialogFragment">
        <argument
            android:name="role"
            app:argType="com.freightbroker.app.domain.model.ContactRole" />
    </dialog>

</navigation>
```

## 3.3 Screen Layouts

### Dashboard Fragment Layout

```xml
<!-- fragment_dashboard.xml -->
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0B0B0B">

    <!-- Status Cards Row -->
    <LinearLayout
        android:id="@+id/statusCardsRow"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="16dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <!-- Active Loads Card -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/activeLoadsCard"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginEnd="8dp"
            app:cardBackgroundColor="#1A1A1A"
            app:cardCornerRadius="12dp"
            app:strokeColor="#7B61FF"
            app:strokeWidth="1dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp"
                android:gravity="center">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Active Loads"
                    android:textColor="#AAAAAA"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/activeLoadsCount"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="6"
                    android:textColor="#7B61FF"
                    android:textSize="32sp"
                    android:textStyle="bold" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Problems Card -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/problemsCard"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            app:cardBackgroundColor="#1A1A1A"
            app:cardCornerRadius="12dp"
            app:strokeColor="#FF7A00"
            app:strokeWidth="1dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp"
                android:gravity="center">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Problems"
                    android:textColor="#AAAAAA"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/problemsCount"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="1"
                    android:textColor="#FF7A00"
                    android:textSize="32sp"
                    android:textStyle="bold" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>
    </LinearLayout>

    <!-- Monthly Stats Section -->
    <com.google.android.material.card.MaterialCardView
        android:id="@+id/monthlyStatsCard"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_margin="16dp"
        app:cardBackgroundColor="#1A1A1A"
        app:cardCornerRadius="12dp"
        app:layout_constraintTop_toBottomOf="@id/statusCardsRow"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="This Month Revenue"
                android:textColor="#AAAAAA"
                android:textSize="14sp" />

            <TextView
                android:id="@+id/monthlyRevenue"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="₹4,80,000"
                android:textColor="#39FF14"
                android:textSize="36sp"
                android:textStyle="bold"
                android:layout_marginTop="8dp" />

            <View
                android:layout_width="match_parent"
                android:layout_height="1dp"
                android:background="#333333"
                android:layout_marginVertical="16dp" />

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal">

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="Driver Pending"
                        android:textColor="#AAAAAA"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/driverPending"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="₹1,20,000"
                        android:textColor="#FFFFFF"
                        android:textSize="18sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="Completed Today"
                        android:textColor="#AAAAAA"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/completedToday"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="3"
                        android:textColor="#FFFFFF"
                        android:textSize="18sp"
                        android:textStyle="bold" />
                </LinearLayout>
            </LinearLayout>
        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

    <!-- Quick Actions -->
    <TextView
        android:id="@+id/quickActionsLabel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Quick Actions"
        android:textColor="#FFFFFF"
        android:textSize="16sp"
        android:textStyle="bold"
        android:layout_marginStart="16dp"
        android:layout_marginTop="24dp"
        app:layout_constraintTop_toBottomOf="@id/monthlyStatsCard"
        app:layout_constraintStart_toStartOf="parent" />

    <LinearLayout
        android:id="@+id/quickActionsRow"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="16dp"
        app:layout_constraintTop_toBottomOf="@id/quickActionsLabel"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <!-- Add Load Button -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/addLoadCard"
            android:layout_width="0dp"
            android:layout_height="80dp"
            android:layout_weight="1"
            android:layout_marginEnd="8dp"
            app:cardBackgroundColor="#7B61FF"
            app:cardCornerRadius="12dp"
            app:rippleColor="#33FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:orientation="vertical"
                android:gravity="center">

                <ImageView
                    android:layout_width="24dp"
                    android:layout_height="24dp"
                    android:src="@drawable/ic_add"
                    app:tint="#FFFFFF" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Add Load"
                    android:textColor="#FFFFFF"
                    android:textSize="12sp"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Search Button -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/searchCard"
            android:layout_width="0dp"
            android:layout_height="80dp"
            android:layout_weight="1"
            android:layout_marginEnd="8dp"
            app:cardBackgroundColor="#2A2A2A"
            app:cardCornerRadius="12dp"
            app:rippleColor="#33FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:orientation="vertical"
                android:gravity="center">

                <ImageView
                    android:layout_width="24dp"
                    android:layout_height="24dp"
                    android:src="@drawable/ic_search"
                    app:tint="#FFFFFF" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Search"
                    android:textColor="#FFFFFF"
                    android:textSize="12sp"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>

        <!-- Contacts Button -->
        <com.google.android.material.card.MaterialCardView
            android:id="@+id/contactsCard"
            android:layout_width="0dp"
            android:layout_height="80dp"
            android:layout_weight="1"
            app:cardBackgroundColor="#2A2A2A"
            app:cardCornerRadius="12dp"
            app:rippleColor="#33FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:orientation="vertical"
                android:gravity="center">

                <ImageView
                    android:layout_width="24dp"
                    android:layout_height="24dp"
                    android:src="@drawable/ic_contacts"
                    app:tint="#FFFFFF" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Contacts"
                    android:textColor="#FFFFFF"
                    android:textSize="12sp"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </com.google.android.material.card.MaterialCardView>
    </LinearLayout>

    <!-- Recent Problem Loads -->
    <TextView
        android:id="@+id/problemLoadsLabel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Problem Loads"
        android:textColor="#FF7A00"
        android:textSize="16sp"
        android:textStyle="bold"
        android:layout_marginStart="16dp"
        android:layout_marginTop="16dp"
        app:layout_constraintTop_toBottomOf="@id/quickActionsRow"
        app:layout_constraintStart_toStartOf="parent" />

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/problemLoadsRecycler"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:layout_marginTop="8dp"
        android:paddingHorizontal="16dp"
        app:layout_constraintTop_toBottomOf="@id/problemLoadsLabel"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- FAB for Quick Add -->
    <com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton
        android:id="@+id/addFab"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Add Load"
        android:textColor="#FFFFFF"
        app:icon="@drawable/ic_add"
        app:iconTint="#FFFFFF"
        app:backgroundTint="#7B61FF"
        android:layout_margin="16dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### Freight Card Item Layout

```xml
<!-- item_freight_card.xml -->
<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginBottom="12dp"
    app:cardBackgroundColor="#1A1A1A"
    app:cardCornerRadius="12dp"
    app:strokeColor="#333333"
    app:strokeWidth="1dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <!-- Header Row: Truck Number + Status -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical">

            <!-- Truck Number -->
            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:orientation="vertical">

                <TextView
                    android:id="@+id/truckNumberFull"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="WB22J8937"
                    android:textColor="#FFFFFF"
                    android:textSize="16sp"
                    android:textStyle="bold" />

                <TextView
                    android:id="@+id/truckLastFour"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="8937"
                    android:textColor="#7B61FF"
                    android:textSize="12sp"
                    android:textStyle="bold" />
            </LinearLayout>

            <!-- Status Badge -->
            <TextView
                android:id="@+id/statusBadge"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="ACTIVE"
                android:textColor="#39FF14"
                android:textSize="10sp"
                android:textStyle="bold"
                android:background="@drawable/bg_status_active"
                android:paddingHorizontal="8dp"
                android:paddingVertical="4dp" />
        </LinearLayout>

        <!-- Weight + Distance Row -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="12dp">

            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Weight"
                    android:textColor="#666666"
                    android:textSize="10sp" />

                <TextView
                    android:id="@+id/weightText"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="25 Ton"
                    android:textColor="#FFFFFF"
                    android:textSize="14sp" />
            </LinearLayout>

            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Distance"
                    android:textColor="#666666"
                    android:textSize="10sp" />

                <TextView
                    android:id="@+id/distanceText"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="450 km"
                    android:textColor="#FFFFFF"
                    android:textSize="14sp" />
            </LinearLayout>
        </LinearLayout>

        <!-- Locations -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="12dp"
            android:gravity="center_vertical">

            <ImageView
                android:layout_width="16dp"
                android:layout_height="16dp"
                android:src="@drawable/ic_location_pickup"
                app:tint="#39FF14" />

            <TextView
                android:id="@+id/pickupLocation"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Kolkata, WB"
                android:textColor="#FFFFFF"
                android:textSize="13sp"
                android:layout_marginStart="8dp" />

            <ImageView
                android:layout_width="16dp"
                android:layout_height="16dp"
                android:src="@drawable/ic_arrow_right"
                app:tint="#666666"
                android:layout_marginHorizontal="8dp" />

            <ImageView
                android:layout_width="16dp"
                android:layout_height="16dp"
                android:src="@drawable/ic_location_drop"
                app:tint="#FF7A00" />

            <TextView
                android:id="@+id/dropLocation"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Mumbai, MH"
                android:textColor="#FFFFFF"
                android:textSize="13sp"
                android:layout_marginStart="8dp" />
        </LinearLayout>

        <!-- Freight Amounts -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="12dp">

            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="My Freight"
                    android:textColor="#666666"
                    android:textSize="10sp" />

                <TextView
                    android:id="@+id/myFreightText"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="₹16,000"
                    android:textColor="#39FF14"
                    android:textSize="16sp"
                    android:textStyle="bold" />
            </LinearLayout>

            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Driver Freight"
                    android:textColor="#666666"
                    android:textSize="10sp" />

                <TextView
                    android:id="@+id/driverFreightText"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="₹14,500"
                    android:textColor="#FFFFFF"
                    android:textSize="16sp"
                    android:textStyle="bold" />
            </LinearLayout>
        </LinearLayout>

        <!-- Driver Info -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="12dp"
            android:gravity="center_vertical">

            <ImageView
                android:layout_width="20dp"
                android:layout_height="20dp"
                android:src="@drawable/ic_driver"
                app:tint="#7B61FF" />

            <TextView
                android:id="@+id/driverName"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Raju Kumar"
                android:textColor="#FFFFFF"
                android:textSize="14sp"
                android:layout_marginStart="8dp" />

            <TextView
                android:id="@+id/driverPhone"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="98765 43210"
                android:textColor="#7B61FF"
                android:textSize="12sp" />
        </LinearLayout>

        <!-- Quick Actions -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="16dp"
            android:gravity="end">

            <!-- Call Button -->
            <ImageButton
                android:id="@+id/btnCall"
                android:layout_width="44dp"
                android:layout_height="44dp"
                android:src="@drawable/ic_call"
                android:background="@drawable/bg_action_button"
                app:tint="#39FF14"
                android:contentDescription="Call Driver" />

            <!-- WhatsApp Button -->
            <ImageButton
                android:id="@+id/btnWhatsapp"
                android:layout_width="44dp"
                android:layout_height="44dp"
                android:src="@drawable/ic_whatsapp"
                android:background="@drawable/bg_action_button"
                app:tint="#25D366"
                android:layout_marginStart="8dp"
                android:contentDescription="WhatsApp" />

            <!-- PhonePe Button -->
            <ImageButton
                android:id="@+id/btnPhonepe"
                android:layout_width="44dp"
                android:layout_height="44dp"
                android:src="@drawable/ic_phonepe"
                android:background="@drawable/bg_action_button"
                app:tint="#5F259F"
                android:layout_marginStart="8dp"
                android:contentDescription="PhonePe" />
        </LinearLayout>
    </LinearLayout>
</com.google.android.material.card.MaterialCardView>
```

---

# 4. NAVIGATION FLOW

## 4.1 User Journey Flows

### Creating a New Load

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Dashboard  │────▶│   Tap "Add"     │────▶│ Create Freight   │
│  or Loads   │     │   FAB/Button    │     │     Screen       │
└─────────────┘     └─────────────────┘     └──────────────────┘
                                                      │
                                                      ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Load Saved │◀────│  Review & Save  │◀────│ Enter Details:   │
│  Show in    │     │  (or Cancel)    │     │ • Truck Number   │
│  List       │     └─────────────────┘     │ • Pickup/Drop    │
└─────────────┘                             │ • Weight         │
                                            │ • Freight Amount │
                                            │ • Add Contacts   │
                                            └──────────────────┘
```

### Truck Auto-Suggestion Flow

```
┌──────────────────┐     ┌──────────────────────┐
│  User types      │     │  Search last 4       │
│  "8937" in       │────▶│  digits in database  │
│  truck field     │     └──────────────────────┘
└──────────────────┘              │
                                  ▼
                    ┌──────────────────────┐
                    │  Show suggestions:   │
                    │  • WB22J8937         │
                    │  • WB44K8937         │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  User selects        │
                    │  suggestion          │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  Auto-fill:          │
                    │  • Associated driver │
                    │  • Owner contact     │
                    │  • Show truck notes  │
                    └──────────────────────┘
```

### Contact Import Flow

```
┌──────────────────┐     ┌──────────────────────┐
│  Tap "Import     │     │  Open Android        │
│  Contact"        │────▶│  Contact Picker      │
└──────────────────┘     └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  User selects        │
                    │  contact             │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  If multiple numbers:│
                    │  Show number picker  │
                    │  • 98765 43210       │
                    │  • 87654 32109       │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  Assign role:        │
                    │  • Driver            │
                    │  • Owner             │
                    │  • Payment Person    │
                    │  • Custom...         │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  Contact saved to    │
                    │  freight & directory │
                    └──────────────────────┘
```

### Swipe Actions on Load Card

```
┌─────────────────────────────────────────────────────────┐
│                    LOAD CARD                            │
│                                                         │
│   Swipe Right ──────────────────────────────▶          │
│   Action: Mark as Completed                             │
│                                                         │
│   Swipe Left ◀──────────────────────────────           │
│   Action: Move to History (Archive)                     │
│                                                         │
│   Long Press ───────────────────────────────           │
│   Action: Show Context Menu                             │
│   • Mark Completed                                      │
│   • Mark as Problem                                     │
│   • Duplicate Load                                      │
│   • Delete                                              │
│                                                         │
│   Tap ──────────────────────────────────────            │
│   Action: Open Freight Detail Screen                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Payment Recording Flow

```
┌──────────────────┐     ┌──────────────────────┐
│  Freight Detail  │     │  Tap "Record         │
│  Screen          │────▶│  Payment"            │
└──────────────────┘     └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  Payment Dialog:     │
                    │  • Type: Broker/     │
                    │    Driver            │
                    │  • Direction: In/Out │
                    │  • Amount            │
                    │  • Status: Pending/  │
                    │    Partial/Completed │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  Payment recorded    │
                    │  Freight summary     │
                    │  auto-updated        │
                    └──────────────────────┘
```

---

# 5. ANDROID PERMISSIONS

## 5.1 Required Permissions

```xml
<!-- AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- ==================== CORE PERMISSIONS ==================== -->

    <!-- Phone & Calling -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    
    <!-- Contacts -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.WRITE_CONTACTS" />
    
    <!-- Storage (for attachments and backup) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="29"
        tools:ignore="ScopedStorage" />
    
    <!-- Android 13+ Media Permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    
    <!-- Camera (for taking photos) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    
    <!-- Internet (for Google Drive backup) -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Google Drive / Google Play Services -->
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />
    
    <!-- Notifications (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Vibration for feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Foreground Service (for backup operations) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    
    <!-- Wake Lock (for backup operations) -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <!-- Receive files from other apps (WhatsApp) -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- ==================== QUERIES (for intent resolution) ==================== -->
    
    <queries>
        <!-- WhatsApp -->
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
        
        <!-- UPI Apps -->
        <package android:name="com.phonepe.app" />
        <package android:name="com.google.android.apps.nbu.paisa.user" />
        <package android:name="in.org.npci.upiapp" />
        <package android:name="com.paytm.app" />
        
        <!-- Intent queries -->
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
        <intent>
            <action android:name="android.intent.action.SEND" />
            <data android:mimeType="*/*" />
        </intent>
        <intent>
            <action android:name="android.intent.action.DIAL" />
        </intent>
        <intent>
            <action android:name="android.intent.action.PICK" />
            <data android:scheme="content" />
        </intent>
    </queries>

    <application
        android:name=".FreightBrokerApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FreightBroker"
        android:requestLegacyExternalStorage="true"
        tools:targetApi="34">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.FreightBroker">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Handle shared files from WhatsApp and other apps -->
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="image/*" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND_MULTIPLE" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="image/*" />
            </intent-filter>
        </activity>

        <!-- File Provider for sharing files -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
```

## 5.2 Permission Handling Utility

```kotlin
// PermissionHandler.kt
object PermissionHandler {
    
    const val REQUEST_CALL_PHONE = 1001
    const val REQUEST_CONTACTS = 1002
    const val REQUEST_STORAGE = 1003
    const val REQUEST_CAMERA = 1004
    const val REQUEST_NOTIFICATIONS = 1005
    
    fun hasCallPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    fun hasContactsPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    fun hasStoragePermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_MEDIA_IMAGES
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_EXTERNAL_STORAGE
            ) == PackageManager.PERMISSION_GRANTED
        }
    }
    
    fun hasCameraPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    fun requestCallPermission(activity: Activity) {
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.CALL_PHONE),
            REQUEST_CALL_PHONE
        )
    }
    
    fun requestContactsPermission(activity: Activity) {
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(
                Manifest.permission.READ_CONTACTS,
                Manifest.permission.WRITE_CONTACTS
            ),
            REQUEST_CONTACTS
        )
    }
    
    fun requestStoragePermission(activity: Activity) {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO
            )
        } else {
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        ActivityCompat.requestPermissions(activity, permissions, REQUEST_STORAGE)
    }
    
    fun requestCameraPermission(activity: Activity) {
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.CAMERA),
            REQUEST_CAMERA
        )
    }
}
```

---

# 6. INTENT HANDLING EXAMPLES

## 6.1 Call Intent

```kotlin
// IntentUtils.kt
object IntentUtils {
    
    /**
     * Open phone dialer with number pre-filled
     */
    fun openDialer(context: Context, phoneNumber: String) {
        val cleanNumber = phoneNumber.replace(Regex("[^+0-9]"), "")
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:$cleanNumber")
        }
        context.startActivity(intent)
    }
    
    /**
     * Direct call (requires CALL_PHONE permission)
     */
    fun makeCall(context: Context, phoneNumber: String) {
        if (!PermissionHandler.hasCallPermission(context)) {
            if (context is Activity) {
                PermissionHandler.requestCallPermission(context)
            }
            return
        }
        
        val cleanNumber = phoneNumber.replace(Regex("[^+0-9]"), "")
        val intent = Intent(Intent.ACTION_CALL).apply {
            data = Uri.parse("tel:$cleanNumber")
        }
        context.startActivity(intent)
    }
}
```

## 6.2 WhatsApp Intent

```kotlin
object WhatsAppUtils {
    
    /**
     * Open WhatsApp chat with a specific number
     */
    fun openChat(context: Context, phoneNumber: String) {
        val cleanNumber = phoneNumber.replace(Regex("[^+0-9]"), "")
        
        // Try WhatsApp Business first, then regular WhatsApp
        val packages = listOf(
            "com.whatsapp.w4b",
            "com.whatsapp"
        )
        
        for (pkg in packages) {
            try {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("https://wa.me/$cleanNumber")
                    setPackage(pkg)
                }
                context.startActivity(intent)
                return
            } catch (e: ActivityNotFoundException) {
                continue
            }
        }
        
        // Fallback: open in browser
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://wa.me/$cleanNumber")
            }
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "WhatsApp not installed", Toast.LENGTH_SHORT).show()
        }
    }
    
    /**
     * Open WhatsApp chat with pre-filled message
     */
    fun openChatWithMessage(
        context: Context, 
        phoneNumber: String, 
        message: String
    ) {
        val cleanNumber = phoneNumber.replace(Regex("[^+0-9]"), "")
        val encodedMessage = URLEncoder.encode(message, "UTF-8")
        
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://wa.me/$cleanNumber?text=$encodedMessage")
                setPackage("com.whatsapp")
            }
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://wa.me/$cleanNumber?text=$encodedMessage")
            }
            context.startActivity(intent)
        }
    }
    
    /**
     * Send a file via WhatsApp
     */
    fun sendFileViaWhatsApp(
        context: Context,
        fileUri: Uri,
        caption: String = "",
        phoneNumber: String? = null
    ) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = context.contentResolver.getType(fileUri)
            putExtra(Intent.EXTRA_STREAM, fileUri)
            if (caption.isNotEmpty()) {
                putExtra(Intent.EXTRA_TEXT, caption)
            }
            if (phoneNumber != null) {
                val cleanNumber = phoneNumber.replace(Regex("[^+0-9]"), "")
                setPackage("com.whatsapp")
            }
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        
        val chooser = Intent.createChooser(intent, "Share via")
        context.startActivity(chooser)
    }
}
```

## 6.3 UPI Payment Intent

```kotlin
object UpiUtils {
    
    /**
     * Open UPI payment with PhonePe preference
     */
    fun openPhonePePayment(
        context: Context,
        upiId: String,
        amount: Double,
        transactionNote: String,
        transactionRef: String
    ) {
        val uri = Uri.Builder()
            .scheme("upi")
            .authority("pay")
            .appendQueryParameter("pa", upiId)
            .appendQueryParameter("pn", "Freight Payment")
            .appendQueryParameter("am", amount.toString())
            .appendQueryParameter("tn", transactionNote)
            .appendQueryParameter("tr", transactionRef)
            .build()
        
        // Try PhonePe first
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
                setPackage("com.phonepe.app")
            }
            context.startActivity(intent)
            return
        } catch (e: ActivityNotFoundException) {
            // PhonePe not installed, try GPay
        }
        
        // Try Google Pay
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
                setPackage("com.google.android.apps.nbu.paisa.user")
            }
            context.startActivity(intent)
            return
        } catch (e: ActivityNotFoundException) {
            // GPay not installed, show chooser
        }
        
        // Show UPI app chooser
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
            }
            val chooser = Intent.createChooser(intent, "Pay with UPI App")
            context.startActivity(chooser)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "No UPI app installed", Toast.LENGTH_SHORT).show()
        }
    }
    
    /**
     * Open PhonePe to specific number (if they have UPI ID linked)
     */
    fun openPhonePeToNumber(context: Context, phoneNumber: String) {
        val cleanNumber = phoneNumber.replace(Regex("[^+0-9]"), "")
        
        // Try to open PhonePe
        try {
            val intent = context.packageManager.getLaunchIntentForPackage("com.phonepe.app")
            if (intent != null) {
                context.startActivity(intent)
            } else {
                throw ActivityNotFoundException()
            }
        } catch (e: ActivityNotFoundException) {
            // Open Play Store to install PhonePe
            try {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("market://details?id=com.phonepe.app")
                }
                context.startActivity(intent)
            } catch (e: ActivityNotFoundException) {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("https://play.google.com/store/apps/details?id=com.phonepe.app")
                }
                context.startActivity(intent)
            }
        }
    }
}
```

## 6.4 Google Maps Intent

```kotlin
object MapsUtils {
    
    /**
     * Open Google Maps with directions between two locations
     */
    fun openDirections(
        context: Context,
        pickupLocation: String,
        dropLocation: String
    ) {
        // Encode location names for URL
        val origin = URLEncoder.encode(pickupLocation, "UTF-8")
        val destination = URLEncoder.encode(dropLocation, "UTF-8")
        
        // Build URI for Google Maps directions
        val uri = Uri.parse("https://www.google.com/maps/dir/?api=1&origin=$origin&destination=$destination&travelmode=driving")
        
        // Try Google Maps app first
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
                setPackage("com.google.android.apps.maps")
            }
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            // Open in browser
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
            }
            context.startActivity(intent)
        }
    }
    
    /**
     * Open Google Maps to show a location
     */
    fun showLocation(context: Context, locationName: String) {
        val encodedLocation = URLEncoder.encode(locationName, "UTF-8")
        val uri = Uri.parse("geo:0,0?q=$encodedLocation")
        
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
                setPackage("com.google.android.apps.maps")
            }
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://www.google.com/maps/search/$encodedLocation")
            }
            context.startActivity(intent)
        }
    }
}
```

## 6.5 Contact Import Intent

```kotlin
object ContactUtils {
    
    const val REQUEST_PICK_CONTACT = 2001
    
    /**
     * Open Android contact picker
     */
    fun pickContact(activity: Activity) {
        if (!PermissionHandler.hasContactsPermission(activity)) {
            PermissionHandler.requestContactsPermission(activity)
            return
        }
        
        val intent = Intent(Intent.ACTION_PICK).apply {
            type = ContactsContract.CommonDataKinds.Phone.CONTENT_TYPE
        }
        activity.startActivityForResult(intent, REQUEST_PICK_CONTACT)
    }
    
    /**
     * Handle contact picker result
     */
    fun handleContactPickerResult(
        context: Context,
        data: Intent?
    ): SelectedContact? {
        data ?: return null
        
        val contactUri = data.data ?: return null
        val cursor = context.contentResolver.query(
            contactUri,
            arrayOf(
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.NUMBER
            ),
            null, null, null
        ) ?: return null
        
        return cursor.use {
            if (it.moveToFirst()) {
                val contactId = it.getLong(0)
                val name = it.getString(1)
                val number = it.getString(2)
                
                SelectedContact(
                    contactId = contactId,
                    name = name,
                    phoneNumber = number,
                    contactUri = contactUri.toString()
                )
            } else {
                null
            }
        }
    }
    
    /**
     * Get all phone numbers for a contact (when contact has multiple numbers)
     */
    fun getAllPhoneNumbersForContact(
        context: Context,
        contactId: Long
    ): List<ContactPhoneNumber> {
        val numbers = mutableListOf<ContactPhoneNumber>()
        
        val cursor = context.contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            arrayOf(
                ContactsContract.CommonDataKinds.Phone.NUMBER,
                ContactsContract.CommonDataKinds.Phone.TYPE
            ),
            "${ContactsContract.CommonDataKinds.Phone.CONTACT_ID} = ?",
            arrayOf(contactId.toString()),
            null
        ) ?: return emptyList()
        
        cursor.use {
            while (it.moveToNext()) {
                val number = it.getString(0)
                val type = it.getInt(1)
                val typeLabel = ContactsContract.CommonDataKinds.Phone.getTypeLabel(
                    context.resources,
                    type,
                    null
                ).toString()
                
                numbers.add(ContactPhoneNumber(number, typeLabel))
            }
        }
        
        return numbers
    }
    
    /**
     * Create new contact in phone (opens Android contact insert screen)
     */
    fun createNewContact(
        context: Context,
        name: String? = null,
        phoneNumber: String? = null
    ) {
        val intent = Intent(Intent.ACTION_INSERT).apply {
            type = ContactsContract.Contacts.CONTENT_TYPE
            name?.let { putExtra(ContactsContract.Intents.Insert.NAME, it) }
            phoneNumber?.let { 
                putExtra(ContactsContract.Intents.Insert.PHONE, it)
                putExtra(ContactsContract.Intents.Insert.PHONE_TYPE, 
                    ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE)
            }
        }
        context.startActivity(intent)
    }
    
    /**
     * Add phone number to existing contact
     */
    fun addToExistingContact(
        context: Context,
        phoneNumber: String
    ) {
        val intent = Intent(Intent.ACTION_INSERT_OR_EDIT).apply {
            type = ContactsContract.Contacts.CONTENT_ITEM_TYPE
            putExtra(ContactsContract.Intents.Insert.PHONE, phoneNumber)
        }
        context.startActivity(intent)
    }
}

data class SelectedContact(
    val contactId: Long,
    val name: String,
    val phoneNumber: String,
    val contactUri: String
)

data class ContactPhoneNumber(
    val number: String,
    val typeLabel: String
)
```

## 6.6 WhatsApp File Share Handling

```kotlin
// In MainActivity.kt

class MainActivity : AppCompatActivity() {
    
    // ...
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleSharedIntent(intent)
    }
    
    private fun handleSharedIntent(intent: Intent) {
        when (intent.action) {
            Intent.ACTION_SEND -> {
                when {
                    intent.type?.startsWith("image/") == true -> {
                        val imageUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                        imageUri?.let { handleSharedImage(it) }
                    }
                    intent.type == "application/pdf" -> {
                        val pdfUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                        pdfUri?.let { handleSharedPdf(it) }
                    }
                }
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                val imageUris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
                imageUris?.let { handleMultipleSharedImages(it) }
            }
        }
    }
    
    private fun handleSharedImage(uri: Uri) {
        // Show dialog to select which freight to attach to
        showFreightSelectionDialog { freightId ->
            // Copy file to app storage
            lifecycleScope.launch {
                val savedAttachment = attachmentRepository.saveAttachment(
                    freightId = freightId,
                    sourceUri = uri,
                    fileType = FileType.IMAGE
                )
                // Show success message
                Toast.makeText(
                    this@MainActivity,
                    "Image attached to freight",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun handleSharedPdf(uri: Uri) {
        showFreightSelectionDialog { freightId ->
            lifecycleScope.launch {
                val savedAttachment = attachmentRepository.saveAttachment(
                    freightId = freightId,
                    sourceUri = uri,
                    fileType = FileType.PDF
                )
                Toast.makeText(
                    this@MainActivity,
                    "PDF attached to freight",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun showFreightSelectionDialog(onSelected: (Long) -> Unit) {
        // Show a dialog with list of active freights
        // User selects one, then callback is called with freight ID
        val dialog = FreightSelectionDialogFragment.newInstance(
            title = "Attach to Freight",
            onFreightSelected = onSelected
        )
        dialog.show(supportFragmentManager, "freight_selection")
    }
}
```

---

# 7. BACKUP ARCHITECTURE

## 7.1 Backup Data Structure

```kotlin
// BackupData.kt
@Serializable
data class BackupData(
    val version: Int = 1,
    val timestamp: Long = System.currentTimeMillis(),
    val freights: List<FreightBackup>,
    val trucks: List<TruckBackup>,
    val contacts: List<ContactBackup>,
    val notes: List<NoteBackup>,
    val truckNotes: List<TruckNoteBackup>,
    val extraCharges: List<ExtraChargeBackup>,
    val payments: List<PaymentBackup>,
    val attachments: List<AttachmentBackup>,
    val tags: List<TagBackup>
)

@Serializable
data class FreightBackup(
    val id: Long,
    val truckNumber: String,
    val pickupLocation: String,
    val dropLocation: String,
    val distanceKm: Double?,
    val weight: Double,
    val weightType: String,
    val driverFreight: Double,
    val brokerFreight: Double,
    val freightType: String,
    val status: String,
    val createdAt: Long,
    val updatedAt: Long,
    val completedAt: Long?,
    val pickupDate: Long?,
    val deliveryDate: Long?,
    val contacts: List<FreightContactBackup>,
    val notes: List<NoteBackup>,
    val extraCharges: List<ExtraChargeBackup>,
    val payments: List<PaymentBackup>,
    val attachments: List<AttachmentBackup>
)

@Serializable
data class TruckBackup(
    val id: Long,
    val truckNumber: String,
    val lastFourDigits: String,
    val notes: String?,
    val totalTrips: Int,
    val hasProblems: Boolean,
    val createdAt: Long,
    val updatedAt: Long
)

@Serializable
data class ContactBackup(
    val id: Long,
    val name: String,
    val phoneNumber: String,
    val altPhone: String?,
    val isImported: Boolean,
    val contactIdUri: String?,
    val notes: String?,
    val createdAt: Long,
    val updatedAt: Long
)

@Serializable
data class FreightContactBackup(
    val contactName: String,
    val contactPhone: String,
    val role: String
)

@Serializable
data class NoteBackup(
    val id: Long,
    val freightId: Long,
    val tag: String,
    val description: String,
    val createdAt: Long
)

@Serializable
data class TruckNoteBackup(
    val id: Long,
    val truckNumber: String,
    val tag: String,
    val description: String,
    val createdAt: Long
)

@Serializable
data class ExtraChargeBackup(
    val id: Long,
    val freightId: Long,
    val chargeType: String,
    val amount: Double,
    val notes: String?,
    val createdAt: Long
)

@Serializable
data class PaymentBackup(
    val id: Long,
    val freightId: Long,
    val paymentType: String,
    val amount: Double,
    val direction: String,
    val status: String,
    val paymentDate: Long?,
    val notes: String?,
    val createdAt: Long
)

@Serializable
data class AttachmentBackup(
    val id: Long,
    val freightId: Long,
    val fileName: String,
    val filePath: String,
    val fileType: String,
    val fileSize: Long,
    val mimeType: String,
    val thumbnailPath: String?,
    val createdAt: Long
)

@Serializable
data class TagBackup(
    val id: Long,
    val name: String,
    val category: String,
    val colorCode: String,
    val isCustom: Boolean,
    val createdAt: Long
)
```

## 7.2 Local Backup Implementation

```kotlin
// LocalBackupManager.kt
class LocalBackupManager @Inject constructor(
    private val context: Context,
    private val freightDao: FreightDao,
    private val truckDao: TruckDao,
    private val contactDao: ContactDao,
    private val noteDao: NoteDao,
    private val extraChargeDao: ExtraChargeDao,
    private val paymentDao: PaymentDao,
    private val attachmentDao: AttachmentDao,
    private val tagDao: TagDao
) {
    private val json = Json { ignoreUnknownKeys = true }
    
    suspend fun createBackup(): File {
        return withContext(Dispatchers.IO) {
            // Collect all data
            val backupData = collectBackupData()
            
            // Create backup file
            val backupDir = File(context.filesDir, "backups")
            if (!backupDir.exists()) {
                backupDir.mkdirs()
            }
            
            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
                .format(Date())
            val backupFile = File(backupDir, "freight_backup_$timestamp.json")
            
            // Write JSON
            val jsonString = json.encodeToString(backupData)
            backupFile.writeText(jsonString)
            
            // Copy attachments to backup folder
            copyAttachmentsToBackup(backupData.attachments)
            
            backupFile
        }
    }
    
    private suspend fun collectBackupData(): BackupData {
        // Collect freights with all related data
        val freights = freightDao.getAllFreightsWithDetails()
        
        // Collect trucks
        val trucks = truckDao.getAllTrucksOnce()
        
        // Collect contacts
        val contacts = contactDao.getAllContactsOnce()
        
        // Collect truck notes
        val truckNotes = truckDao.getAllTruckNotes()
        
        // Collect tags
        val tags = tagDao.getAllTags()
        
        return BackupData(
            freights = freights.map { it.toBackup() },
            trucks = trucks.map { it.toBackup() },
            contacts = contacts.map { it.toBackup() },
            notes = freights.flatMap { it.notes }.map { it.toBackup() },
            truckNotes = truckNotes.map { it.toBackup() },
            extraCharges = freights.flatMap { it.extraCharges }.map { it.toBackup() },
            payments = freights.flatMap { it.payments }.map { it.toBackup() },
            attachments = freights.flatMap { it.attachments }.map { it.toBackup() },
            tags = tags.map { it.toBackup() }
        )
    }
    
    suspend fun restoreBackup(backupFile: File): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val jsonString = backupFile.readText()
                val backupData = json.decodeFromString<BackupData>(jsonString)
                
                // Clear existing data
                clearAllData()
                
                // Restore all data
                restoreData(backupData)
                
                // Restore attachments
                restoreAttachments(backupData.attachments)
                
                true
            } catch (e: Exception) {
                Log.e("LocalBackupManager", "Restore failed", e)
                false
            }
        }
    }
    
    private suspend fun clearAllData() {
        freightDao.deleteAll()
        truckDao.deleteAll()
        contactDao.deleteAll()
        noteDao.deleteAll()
        extraChargeDao.deleteAll()
        paymentDao.deleteAll()
        attachmentDao.deleteAll()
        tagDao.deleteAll()
    }
    
    private suspend fun restoreData(backupData: BackupData) {
        // Restore in correct order (respecting foreign keys)
        
        // 1. Tags
        backupData.tags.forEach { tagDao.insert(tag.toEntity()) }
        
        // 2. Trucks
        backupData.trucks.forEach { truckDao.insert(it.toEntity()) }
        
        // 3. Contacts
        backupData.contacts.forEach { contactDao.insert(it.toEntity()) }
        
        // 4. Freights
        backupData.freights.forEach { freightBackup ->
            val freightId = freightDao.insert(freightBackup.toEntity())
            
            // 5. Freight contacts
            freightBackup.contacts.forEach { contactBackup ->
                val contact = contactDao.findByPhone(contactBackup.contactPhone)
                if (contact != null) {
                    freightContactDao.insert(
                        FreightContactEntity(
                            freightId = freightId,
                            contactId = contact.id,
                            role = ContactRole.valueOf(contactBackup.role)
                        )
                    )
                }
            }
            
            // 6. Notes
            freightBackup.notes.forEach { noteBackup ->
                noteDao.insert(noteBackup.toEntity(freightId))
            }
            
            // 7. Extra charges
            freightBackup.extraCharges.forEach { chargeBackup ->
                extraChargeDao.insert(chargeBackup.toEntity(freightId))
            }
            
            // 8. Payments
            freightBackup.payments.forEach { paymentBackup ->
                paymentDao.insert(paymentBackup.toEntity(freightId))
            }
            
            // 9. Attachments
            freightBackup.attachments.forEach { attachmentBackup ->
                attachmentDao.insert(attachmentBackup.toEntity(freightId))
            }
        }
        
        // 10. Truck notes
        backupData.truckNotes.forEach { truckNoteBackup ->
            val truck = truckDao.findByTruckNumber(truckNoteBackup.truckNumber)
            if (truck != null) {
                truckNoteDao.insert(truckNoteBackup.toEntity(truck.id))
            }
        }
    }
    
    fun exportToFile(backupFile: File, destinationUri: Uri): Boolean {
        return try {
            context.contentResolver.openOutputStream(destinationUri)?.use { output ->
                backupFile.inputStream().use { input ->
                    input.copyTo(output)
                }
            }
            true
        } catch (e: Exception) {
            Log.e("LocalBackupManager", "Export failed", e)
            false
        }
    }
}
```

## 7.3 Google Drive Backup Implementation

```kotlin
// GoogleDriveBackupManager.kt
class GoogleDriveBackupManager @Inject constructor(
    private val context: Context,
    private val localBackupManager: LocalBackupManager
) {
    private val driveService: Drive? by lazy { initializeDriveService() }
    
    private fun initializeDriveService(): Drive? {
        return try {
            val account = GoogleSignIn.getLastSignedInAccount(context)
            if (account == null) {
                Log.w("GoogleDriveBackupManager", "No signed in account")
                return null
            }
            
            val credential = GoogleAccountCredential.usingOAuth2(
                context,
                listOf(DriveScopes.DRIVE_APPDATA)
            )
            credential.selectedAccount = account.account
            
            Drive.Builder(
                NetHttpTransport(),
                GsonFactory(),
                credential
            ).setApplicationName("Freight Broker").build()
        } catch (e: Exception) {
            Log.e("GoogleDriveBackupManager", "Failed to initialize Drive", e)
            null
        }
    }
    
    suspend fun uploadBackup(): Result<String> = withContext(Dispatchers.IO) {
        val drive = driveService
            ?: return@withContext Result.failure(Exception("Google Drive not available"))
        
        try {
            // Create local backup first
            val localBackupFile = localBackupManager.createBackup()
            
            // Create file metadata
            val metadata = File().apply {
                name = "freight_backup_${System.currentTimeMillis()}.json"
                parents = listOf("appDataFolder")
            }
            
            // Upload to Drive
            val mediaContent = FileContent("application/json", localBackupFile)
            val driveFile = drive.files().create(metadata, mediaContent)
                .setFields("id, name")
                .execute()
            
            Result.success("Backup uploaded: ${driveFile.name}")
        } catch (e: Exception) {
            Log.e("GoogleDriveBackupManager", "Upload failed", e)
            Result.failure(e)
        }
    }
    
    suspend fun listBackups(): Result<List<DriveBackupInfo>> = withContext(Dispatchers.IO) {
        val drive = driveService
            ?: return@withContext Result.failure(Exception("Google Drive not available"))
        
        try {
            val result = drive.files().list()
                .setSpaces("appDataFolder")
                .setFields("files(id, name, createdTime, size)")
                .execute()
            
            val backups = result.files.map { file ->
                DriveBackupInfo(
                    id = file.id,
                    name = file.name,
                    createdTime = file.createdTime.value,
                    size = file.size ?: 0
                )
            }.sortedByDescending { it.createdTime }
            
            Result.success(backups)
        } catch (e: Exception) {
            Log.e("GoogleDriveBackupManager", "List failed", e)
            Result.failure(e)
        }
    }
    
    suspend fun downloadAndRestore(fileId: String): Result<String> = withContext(Dispatchers.IO) {
        val drive = driveService
            ?: return@withContext Result.failure(Exception("Google Drive not available"))
        
        try {
            // Download file
            val tempFile = File(context.cacheDir, "restore_temp.json")
            
            drive.files().get(fileId)
                .executeMediaAndDownloadTo(tempFile.outputStream())
            
            // Restore from file
            val success = localBackupManager.restoreBackup(tempFile)
            
            tempFile.delete()
            
            if (success) {
                Result.success("Backup restored successfully")
            } else {
                Result.failure(Exception("Restore failed"))
            }
        } catch (e: Exception) {
            Log.e("GoogleDriveBackupManager", "Download/restore failed", e)
            Result.failure(e)
        }
    }
    
    fun isSignedIn(): Boolean {
        val account = GoogleSignIn.getLastSignedInAccount(context)
        return account != null
    }
    
    fun signIn(activity: Activity, requestCode: Int) {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestScopes(Scope(DriveScopes.DRIVE_APPDATA))
            .build()
        
        val client = GoogleSignIn.getClient(activity, gso)
        activity.startActivityForResult(client.signInIntent, requestCode)
    }
}

data class DriveBackupInfo(
    val id: String,
    val name: String,
    val createdTime: Long,
    val size: Long
)
```

## 7.4 Auto-Backup Scheduler

```kotlin
// BackupWorker.kt
class BackupWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {
    
    @Inject lateinit var googleDriveBackupManager: GoogleDriveBackupManager
    @Inject lateinit var preferencesManager: PreferencesManager
    
    override suspend fun doWork(): Result {
        // Check if auto-backup is enabled
        val autoBackupEnabled = preferencesManager.isAutoBackupEnabled()
        if (!autoBackupEnabled) {
            return Result.success()
        }
        
        // Check WiFi requirement
        val requireWifi = preferencesManager.isWifiOnlyBackup()
        val connectivityManager = applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val networkInfo = connectivityManager.activeNetworkInfo
        
        if (requireWifi && networkInfo?.type != ConnectivityManager.TYPE_WIFI) {
            return Result.retry()
        }
        
        // Perform backup
        return when (googleDriveBackupManager.uploadBackup()) {
            is Result.Success -> {
                preferencesManager.setLastBackupTime(System.currentTimeMillis())
                Result.success()
            }
            is Result.Failure -> Result.retry()
        }
    }
}

// Schedule backup
fun scheduleAutoBackup(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresBatteryNotLow(true)
        .build()
    
    val backupRequest = PeriodicWorkRequestBuilder<BackupWorker>(
        1, TimeUnit.DAYS,
        15, TimeUnit.MINUTES
    )
        .setConstraints(constraints)
        .build()
    
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "auto_backup",
        ExistingPeriodicWorkPolicy.KEEP,
        backupRequest
    )
}
```

---

# 8. ATTACHMENT MANAGEMENT

## 8.1 Attachment Storage Structure

```
/app_data/files/
├── images/
│   ├── freight_1/
│   │   ├── img_20240101_123456.jpg
│   │   └── img_20240101_123457.jpg
│   └── thumbnails/
│       └── thumb_img_20240101_123456.jpg
├── documents/
│   ├── freight_1/
│   │   ├── lr_copy.pdf
│   │   └── invoice.pdf
│   └── freight_2/
│       └── agreement.pdf
└── temp/
    └── receiving_file.jpg
```

## 8.2 Attachment Repository

```kotlin
// AttachmentRepository.kt
class AttachmentRepository @Inject constructor(
    private val context: Context,
    private val attachmentDao: AttachmentDao
) {
    private val attachmentsDir = File(context.filesDir, "attachments")
    private val imagesDir = File(attachmentsDir, "images")
    private val documentsDir = File(attachmentsDir, "documents")
    private val tempDir = File(attachmentsDir, "temp")
    
    init {
        imagesDir.mkdirs()
        documentsDir.mkdirs()
        tempDir.mkdirs()
    }
    
    /**
     * Save attachment from URI (shared from WhatsApp, gallery, etc.)
     */
    suspend fun saveAttachment(
        freightId: Long,
        sourceUri: Uri,
        fileType: FileType
    ): AttachmentEntity = withContext(Dispatchers.IO) {
        val mimeType = context.contentResolver.getType(sourceUri) ?: "application/octet-stream"
        val fileName = generateFileName(mimeType)
        
        // Determine target directory
        val targetDir = when (fileType) {
            FileType.IMAGE -> File(imagesDir, "freight_$freightId")
            FileType.PDF, FileType.DOCUMENT -> File(documentsDir, "freight_$freightId")
            else -> File(documentsDir, "freight_$freightId")
        }
        targetDir.mkdirs()
        
        val targetFile = File(targetDir, fileName)
        
        // Copy file to app storage
        context.contentResolver.openInputStream(sourceUri)?.use { input ->
            targetFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }
        
        // Generate thumbnail for images
        val thumbnailPath = if (fileType == FileType.IMAGE) {
            generateThumbnail(targetFile, freightId)
        } else {
            null
        }
        
        // Create database record
        val attachment = AttachmentEntity(
            freightId = freightId,
            fileName = fileName,
            filePath = targetFile.absolutePath,
            fileType = fileType,
            fileSize = targetFile.length(),
            mimeType = mimeType,
            thumbnailPath = thumbnailPath
        )
        
        val id = attachmentDao.insert(attachment)
        attachment.copy(id = id)
    }
    
    /**
     * Save attachment from camera capture
     */
    suspend fun saveFromCamera(
        freightId: Long,
        photoFile: File
    ): AttachmentEntity = withContext(Dispatchers.IO) {
        val mimeType = "image/jpeg"
        val fileName = generateFileName(mimeType)
        
        val targetDir = File(imagesDir, "freight_$freightId")
        targetDir.mkdirs()
        
        val targetFile = File(targetDir, fileName)
        photoFile.copyTo(targetFile, overwrite = true)
        
        val thumbnailPath = generateThumbnail(targetFile, freightId)
        
        val attachment = AttachmentEntity(
            freightId = freightId,
            fileName = fileName,
            filePath = targetFile.absolutePath,
            fileType = FileType.IMAGE,
            fileSize = targetFile.length(),
            mimeType = mimeType,
            thumbnailPath = thumbnailPath
        )
        
        val id = attachmentDao.insert(attachment)
        attachment.copy(id = id)
    }
    
    /**
     * Generate thumbnail for image
     */
    private fun generateThumbnail(imageFile: File, freightId: Long): String? {
        return try {
            val thumbnailDir = File(imagesDir, "thumbnails")
            thumbnailDir.mkdirs()
            
            val thumbnailFile = File(thumbnailDir, "thumb_${imageFile.name}")
            
            // Decode and resize
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeFile(imageFile.absolutePath, options)
            
            val scale = calculateInSampleSize(options, 200, 200)
            options.inJustDecodeBounds = false
            options.inSampleSize = scale
            
            val bitmap = BitmapFactory.decodeFile(imageFile.absolutePath, options)
            
            bitmap?.let {
                it.compress(Bitmap.CompressFormat.JPEG, 80, thumbnailFile.outputStream())
                it.recycle()
                thumbnailFile.absolutePath
            }
        } catch (e: Exception) {
            Log.e("AttachmentRepository", "Thumbnail generation failed", e)
            null
        }
    }
    
    private fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        val (width, height) = options.outWidth to options.outHeight
        var inSampleSize = 1
        
        if (height > reqHeight || width > reqWidth) {
            val halfHeight = height / 2
            val halfWidth = width / 2
            
            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }
        
        return inSampleSize
    }
    
    private fun generateFileName(mimeType: String): String {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
            .format(Date())
        
        val extension = when (mimeType) {
            "image/jpeg" -> "jpg"
            "image/png" -> "png"
            "image/webp" -> "webp"
            "application/pdf" -> "pdf"
            else -> "bin"
        }
        
        return "file_$timestamp.$extension"
    }
    
    /**
     * Get URI for sharing
     */
    fun getShareableUri(attachment: AttachmentEntity): Uri {
        val file = File(attachment.filePath)
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
    }
    
    /**
     * Delete attachment
     */
    suspend fun deleteAttachment(attachment: AttachmentEntity) = withContext(Dispatchers.IO) {
        // Delete file
        File(attachment.filePath).delete()
        
        // Delete thumbnail
        attachment.thumbnailPath?.let { File(it).delete() }
        
        // Delete database record
        attachmentDao.delete(attachment)
    }
    
    /**
     * Delete all attachments for a freight
     */
    suspend fun deleteAttachmentsForFreight(freightId: Long) = withContext(Dispatchers.IO) {
        val attachments = attachmentDao.getAttachmentsByFreight(freightId)
        
        attachments.forEach { attachment ->
            File(attachment.filePath).delete()
            attachment.thumbnailPath?.let { File(it).delete() }
        }
        
        // Delete directories
        File(imagesDir, "freight_$freightId").deleteRecursively()
        File(documentsDir, "freight_$freightId").deleteRecursively()
        
        attachmentDao.deleteByFreight(freightId)
    }
}
```

## 8.3 Attachment Viewer

```kotlin
// AttachmentViewerFragment.kt
class AttachmentViewerFragment : Fragment() {
    
    private var _binding: FragmentAttachmentViewerBinding? = null
    private val binding get() = _binding!!
    
    private val args: AttachmentViewerFragmentArgs by navArgs()
    
    private val viewModel: AttachmentViewModel by viewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAttachmentViewerBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel.loadAttachment(args.attachmentId)
        
        viewModel.attachment.observe(viewLifecycleOwner) { attachment ->
            when (attachment.fileType) {
                FileType.IMAGE -> showImage(attachment)
                FileType.PDF -> showPdf(attachment)
                else -> showGeneric(attachment)
            }
        }
        
        setupActions()
    }
    
    private fun showImage(attachment: AttachmentEntity) {
        binding.imageView.visibility = View.VISIBLE
        binding.pdfView.visibility = View.GONE
        
        // Use Coil for image loading
        binding.imageView.load(File(attachment.filePath)) {
            crossfade(true)
            listener(
                onError = { _, error ->
                    Log.e("AttachmentViewer", "Image load error", error.throwable)
                }
            )
        }
        
        // Enable zoom
        binding.imageView.setOnTouchListener(object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
            var scale = 1f
            override fun onScale(detector: ScaleGestureDetector): Boolean {
                scale *= detector.scaleFactor
                scale = scale.coerceIn(0.5f, 5f)
                binding.imageView.scaleX = scale
                binding.imageView.scaleY = scale
                return true
            }
        })
    }
    
    private fun showPdf(attachment: AttachmentEntity) {
        binding.imageView.visibility = View.GONE
        binding.pdfView.visibility = View.VISIBLE
        
        // Use Android PdfRenderer
        val file = File(attachment.filePath)
        val fileDescriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
        val pdfRenderer = PdfRenderer(fileDescriptor)
        
        // Show first page
        val page = pdfRenderer.openPage(0)
        val bitmap = Bitmap.createBitmap(
            page.width * 2,
            page.height * 2,
            Bitmap.Config.ARGB_8888
        )
        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
        binding.pdfView.setImageBitmap(bitmap)
        page.close()
        
        // Store renderer for page navigation
        viewModel.setPdfRenderer(pdfRenderer)
    }
    
    private fun showGeneric(attachment: AttachmentEntity) {
        binding.imageView.visibility = View.GONE
        binding.pdfView.visibility = View.GONE
        
        // Show file info with option to open externally
        binding.fileNameText.text = attachment.fileName
        binding.fileSizeText.text = formatFileSize(attachment.fileSize)
        binding.openExternalButton.visibility = View.VISIBLE
    }
    
    private fun setupActions() {
        binding.shareButton.setOnClickListener {
            viewModel.attachment.value?.let { attachment ->
                shareAttachment(attachment)
            }
        }
        
        binding.deleteButton.setOnClickListener {
            showDeleteConfirmation()
        }
    }
    
    private fun shareAttachment(attachment: AttachmentEntity) {
        val uri = viewModel.getShareableUri(attachment)
        
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = attachment.mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        
        startActivity(Intent.createChooser(intent, "Share Attachment"))
    }
    
    private fun showDeleteConfirmation() {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Delete Attachment")
            .setMessage("Are you sure you want to delete this attachment?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Delete") { _, _ ->
                viewModel.deleteAttachment()
                findNavController().navigateUp()
            }
            .show()
    }
    
    private fun formatFileSize(bytes: Long): String {
        return when {
            bytes < 1024 -> "$bytes B"
            bytes < 1024 * 1024 -> "${bytes / 1024} KB"
            else -> "${bytes / (1024 * 1024)} MB"
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

---

# 9. SEARCH IMPLEMENTATION

## 9.1 Search Index Manager

```kotlin
// SearchIndexManager.kt
class SearchIndexManager @Inject constructor(
    private val searchIndexDao: SearchIndexDao,
    private val freightDao: FreightDao,
    private val truckDao: TruckDao,
    private val contactDao: ContactDao,
    private val noteDao: NoteDao
) {
    /**
     * Build or rebuild the entire search index
     */
    suspend fun rebuildIndex() = withContext(Dispatchers.IO) {
        // Clear existing index
        searchIndexDao.clearAll()
        
        // Index freights
        freightDao.getAllFreightsOnce().forEach { freight ->
            indexFreight(freight)
        }
        
        // Index trucks
        truckDao.getAllTrucksOnce().forEach { truck ->
            indexTruck(truck)
        }
        
        // Index contacts
        contactDao.getAllContactsOnce().forEach { contact ->
            indexContact(contact)
        }
        
        // Index notes
        noteDao.getAllNotes().forEach { note ->
            indexNote(note)
        }
    }
    
    /**
     * Index a freight record
     */
    suspend fun indexFreight(freight: FreightEntity) {
        val indices = mutableListOf<SearchIndexEntity>()
        
        // Add truck number search
        val truck = truckDao.getTruckById(freight.truckId)
        truck?.let {
            indices.add(
                SearchIndexEntity(
                    entityType = SearchEntityType.FREIGHT,
                    entityId = freight.id,
                    searchText = it.truckNumber.lowercase()
                )
            )
            indices.add(
                SearchIndexEntity(
                    entityType = SearchEntityType.FREIGHT,
                    entityId = freight.id,
                    searchText = it.lastFourDigits.lowercase()
                )
            )
        }
        
        // Add location search
        indices.add(
            SearchIndexEntity(
                entityType = SearchEntityType.FREIGHT,
                entityId = freight.id,
                searchText = freight.pickupLocation.lowercase()
            )
        )
        indices.add(
            SearchIndexEntity(
                entityType = SearchEntityType.FREIGHT,
                entityId = freight.id,
                searchText = freight.dropLocation.lowercase()
            )
        )
        
        // Add contacts to freight index
        val contacts = contactDao.getContactsByFreight(freight.id)
        contacts.forEach { contact ->
            indices.add(
                SearchIndexEntity(
                    entityType = SearchEntityType.FREIGHT,
                    entityId = freight.id,
                    searchText = contact.name.lowercase()
                )
            )
            indices.add(
                SearchIndexEntity(
                    entityType = SearchEntityType.FREIGHT,
                    entityId = freight.id,
                    searchText = contact.phoneNumber.replace(Regex("[^0-9]"), "")
                )
            )
        }
        
        searchIndexDao.insertIndices(indices)
    }
    
    /**
     * Index a truck record
     */
    suspend fun indexTruck(truck: TruckEntity) {
        val indices = listOf(
            SearchIndexEntity(
                entityType = SearchEntityType.TRUCK,
                entityId = truck.id,
                searchText = truck.truckNumber.lowercase()
            ),
            SearchIndexEntity(
                entityType = SearchEntityType.TRUCK,
                entityId = truck.id,
                searchText = truck.lastFourDigits.lowercase()
            )
        )
        
        searchIndexDao.insertIndices(indices)
    }
    
    /**
     * Index a contact record
     */
    suspend fun indexContact(contact: ContactEntity) {
        val indices = mutableListOf<SearchIndexEntity>()
        
        indices.add(
            SearchIndexEntity(
                entityType = SearchEntityType.CONTACT,
                entityId = contact.id,
                searchText = contact.name.lowercase()
            )
        )
        indices.add(
            SearchIndexEntity(
                entityType = SearchEntityType.CONTACT,
                entityId = contact.id,
                searchText = contact.phoneNumber.replace(Regex("[^0-9]"), "")
            )
        )
        contact.altPhone?.let {
            indices.add(
                SearchIndexEntity(
                    entityType = SearchEntityType.CONTACT,
                    entityId = contact.id,
                    searchText = it.replace(Regex("[^0-9]"), "")
                )
            )
        }
        
        searchIndexDao.insertIndices(indices)
    }
    
    /**
     * Index a note
     */
    suspend fun indexNote(note: NoteEntity) {
        val index = SearchIndexEntity(
            entityType = SearchEntityType.NOTE,
            entityId = note.id,
            searchText = "${note.tag} ${note.description}".lowercase()
        )
        
        searchIndexDao.insertIndex(index)
    }
    
    /**
     * Perform global search
     */
    suspend fun search(query: String): SearchResult = withContext(Dispatchers.IO) {
        val cleanQuery = query.trim().lowercase()
        
        if (cleanQuery.length < 2) {
            return@withContext SearchResult.empty()
        }
        
        // Search in index
        val indexResults = searchIndexDao.search(cleanQuery)
        
        // Group by entity type
        val freightIds = mutableSetOf<Long>()
        val truckIds = mutableSetOf<Long>()
        val contactIds = mutableSetOf<Long>()
        val noteIds = mutableSetOf<Long>()
        
        indexResults.forEach { result ->
            when (result.entity_type) {
                SearchEntityType.FREIGHT -> freightIds.add(result.entity_id)
                SearchEntityType.TRUCK -> truckIds.add(result.entity_id)
                SearchEntityType.CONTACT -> contactIds.add(result.entity_id)
                SearchEntityType.NOTE -> noteIds.add(result.entity_id)
            }
        }
        
        // Load actual entities
        SearchResult(
            freights = freightIds.mapNotNull { freightDao.getFreightById(it) },
            trucks = truckIds.mapNotNull { truckDao.getTruckById(it) },
            contacts = contactIds.mapNotNull { contactDao.getContactById(it) },
            notes = noteIds.mapNotNull { noteDao.getNoteById(it) }
        )
    }
    
    /**
     * Update index when freight is updated
     */
    suspend fun updateFreightIndex(freightId: Long) {
        searchIndexDao.deleteAllIndicesForEntity(freightId)
        freightDao.getFreightById(freightId)?.let {
            indexFreight(it)
        }
    }
}

data class SearchResult(
    val freights: List<FreightEntity>,
    val trucks: List<TruckEntity>,
    val contacts: List<ContactEntity>,
    val notes: List<NoteEntity>
) {
    companion object {
        fun empty() = SearchResult(
            freights = emptyList(),
            trucks = emptyList(),
            contacts = emptyList(),
            notes = emptyList()
        )
        
        fun hasResults(result: SearchResult) = 
            result.freights.isNotEmpty() ||
            result.trucks.isNotEmpty() ||
            result.contacts.isNotEmpty() ||
            result.notes.isNotEmpty()
    }
}
```

## 9.2 Search UI

```kotlin
// SearchFragment.kt
class SearchFragment : Fragment() {
    
    private var _binding: FragmentSearchBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: SearchViewModel by viewModels()
    
    private lateinit var freightAdapter: FreightSearchAdapter
    private lateinit var truckAdapter: TruckSearchAdapter
    private lateinit var contactAdapter: ContactSearchAdapter
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSearchBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupSearchBar()
        setupAdapters()
        setupObservers()
    }
    
    private fun setupSearchBar() {
        binding.searchView.apply {
            // Focus on open
            post { requestFocus() }
            
            // Debounce search
            doOnTextChanged { text, _, _, _ ->
                viewModel.search(text?.toString() ?: "")
            }
        }
    }
    
    private fun setupAdapters() {
        freightAdapter = FreightSearchAdapter { freight ->
            findNavController().navigate(
                SearchFragmentDirections.actionSearchToFreightDetail(freight.id)
            )
        }
        
        truckAdapter = TruckSearchAdapter { truck ->
            findNavController().navigate(
                SearchFragmentDirections.actionSearchToTruckDetail(truck.id)
            )
        }
        
        contactAdapter = ContactSearchAdapter { contact ->
            findNavController().navigate(
                SearchFragmentDirections.actionSearchToContactDetail(contact.id)
            )
        }
        
        binding.freightsRecycler.adapter = freightAdapter
        binding.trucksRecycler.adapter = truckAdapter
        binding.contactsRecycler.adapter = contactAdapter
    }
    
    private fun setupObservers() {
        viewModel.searchResult.observe(viewLifecycleOwner) { result ->
            binding.emptyState.visibility = if (SearchResult.hasResults(result)) {
                View.GONE
            } else {
                View.VISIBLE
            }
            
            // Show/hide sections
            binding.freightsSection.visibility = if (result.freights.isNotEmpty()) {
                View.VISIBLE
            } else {
                View.GONE
            }
            binding.trucksSection.visibility = if (result.trucks.isNotEmpty()) {
                View.VISIBLE
            } else {
                View.GONE
            }
            binding.contactsSection.visibility = if (result.contacts.isNotEmpty()) {
                View.VISIBLE
            } else {
                View.GONE
            }
            
            // Update adapters
            freightAdapter.submitList(result.freights)
            truckAdapter.submitList(result.trucks)
            contactAdapter.submitList(result.contacts)
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// SearchViewModel.kt
class SearchViewModel @Inject constructor(
    private val searchIndexManager: SearchIndexManager
) : ViewModel() {
    
    private val _searchResult = MutableLiveData<SearchResult>()
    val searchResult: LiveData<SearchResult> = _searchResult
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private var searchJob: Job? = null
    
    fun search(query: String) {
        searchJob?.cancel()
        
        if (query.isBlank()) {
            _searchResult.value = SearchResult.empty()
            return
        }
        
        searchJob = viewModelScope.launch {
            _isLoading.value = true
            delay(300) // Debounce
            
            val result = searchIndexManager.search(query)
            _searchResult.value = result
            _isLoading.value = false
        }
    }
}
```

---

# 10. ERROR HANDLING

## 10.1 Error Types

```kotlin
// AppError.kt
sealed class AppError {
    
    // Database errors
    data class DatabaseError(
        val message: String,
        val cause: Throwable? = null
    ) : AppError()
    
    data class EntityNotFound(
        val entityType: String,
        val id: Long
    ) : AppError()
    
    data class ConstraintViolation(
        val message: String
    ) : AppError()
    
    // Permission errors
    data class PermissionDenied(
        val permission: String
    ) : AppError()
    
    // File errors
    data class FileNotFound(
        val path: String
    ) : AppError()
    
    data class FileTooLarge(
        val size: Long,
        val maxSize: Long
    ) : AppError()
    
    data class StorageFull(
        val required: Long,
        val available: Long
    ) : AppError()
    
    data class UnsupportedFileType(
        val mimeType: String
    ) : AppError()
    
    // Network errors (for backup)
    data class NetworkError(
        val message: String,
        val cause: Throwable? = null
    ) : AppError()
    
    data class AuthenticationError(
        val provider: String
    ) : AppError()
    
    // Validation errors
    data class ValidationError(
        val field: String,
        val message: String
    ) : AppError()
    
    // Intent errors
    data class IntentFailed(
        val action: String,
        val cause: Throwable? = null
    ) : AppError()
    
    data class AppNotInstalled(
        val packageName: String
    ) : AppError()
    
    // Backup errors
    data class BackupFailed(
        val reason: String,
        val cause: Throwable? = null
    ) : AppError()
    
    data class RestoreFailed(
        val reason: String,
        val cause: Throwable? = null
    ) : AppError()
    
    // Unknown
    data class UnknownError(
        val message: String,
        val cause: Throwable? = null
    ) : AppError()
}

// Extension to get user-friendly message
fun AppError.toUserMessage(context: Context): String {
    return when (this) {
        is AppError.DatabaseError -> 
            context.getString(R.string.error_database, message)
        
        is AppError.EntityNotFound -> 
            context.getString(R.string.error_not_found, entityType)
        
        is AppError.ConstraintViolation -> 
            message
        
        is AppError.PermissionDenied -> 
            context.getString(R.string.error_permission_denied, permission)
        
        is AppError.FileNotFound -> 
            context.getString(R.string.error_file_not_found)
        
        is AppError.FileTooLarge -> 
            context.getString(R.string.error_file_too_large)
        
        is AppError.StorageFull -> 
            context.getString(R.string.error_storage_full)
        
        is AppError.UnsupportedFileType -> 
            context.getString(R.string.error_unsupported_file_type, mimeType)
        
        is AppError.NetworkError -> 
            context.getString(R.string.error_network)
        
        is AppError.AuthenticationError -> 
            context.getString(R.string.error_authentication, provider)
        
        is AppError.ValidationError -> 
            context.getString(R.string.error_validation, field, message)
        
        is AppError.IntentFailed -> 
            context.getString(R.string.error_intent_failed, action)
        
        is AppError.AppNotInstalled -> 
            context.getString(R.string.error_app_not_installed)
        
        is AppError.BackupFailed -> 
            context.getString(R.string.error_backup_failed, reason)
        
        is AppError.RestoreFailed -> 
            context.getString(R.string.error_restore_failed, reason)
        
        is AppError.UnknownError -> 
            context.getString(R.string.error_unknown)
    }
}
```

## 10.2 Result Wrapper

```kotlin
// Result.kt
sealed class Result<out T> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Error(val error: AppError) : Result<Nothing>()
    
    inline fun <R> map(transform: (T) -> R): Result<R> {
        return when (this) {
            is Success -> Success(transform(data))
            is Error -> this
        }
    }
    
    inline fun onSuccess(action: (T) -> Unit): Result<T> {
        if (this is Success) action(data)
        return this
    }
    
    inline fun onError(action: (AppError) -> Unit): Result<T> {
        if (this is Error) action(error)
        return this
    }
    
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Error -> null
    }
    
    fun getOrThrow(): T = when (this) {
        is Success -> data
        is Error -> throw IllegalStateException(error.toString())
    }
}

// Extensions for common operations
inline fun <T> safeCall(block: () -> T): Result<T> {
    return try {
        Result.Success(block())
    } catch (e: Exception) {
        Result.Error(AppError.UnknownError(e.message ?: "Unknown error", e))
    }
}

suspend inline fun <T> safeSuspendCall(crossinline block: suspend () -> T): Result<T> {
    return try {
        Result.Success(block())
    } catch (e: Exception) {
        Result.Error(AppError.UnknownError(e.message ?: "Unknown error", e))
    }
}
```

## 10.3 Error Handler Utility

```kotlin
// ErrorHandler.kt
class ErrorHandler @Inject constructor(
    private val context: Context
) {
    private val _errorEvent = MutableSharedFlow<AppError>()
    val errorEvent: SharedFlow<AppError> = _errorEvent
    
    suspend fun handleError(error: AppError) {
        // Log error
        Log.e("ErrorHandler", "Error: $error")
        
        // Emit to flow for observation
        _errorEvent.emit(error)
    }
    
    fun showErrorToast(error: AppError) {
        Toast.makeText(context, error.toUserMessage(context), Toast.LENGTH_LONG).show()
    }
    
    fun showSnackbar(view: View, error: AppError, action: (() -> Unit)? = null) {
        val snackbar = Snackbar.make(
            view,
            error.toUserMessage(context),
            Snackbar.LENGTH_LONG
        )
        
        action?.let {
            snackbar.setAction("Retry") { it() }
        }
        
        snackbar.show()
    }
    
    fun showDialog(
        activity: Activity,
        error: AppError,
        onRetry: (() -> Unit)? = null
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Error")
            .setMessage(error.toUserMessage(context))
            .setPositiveButton("OK", null)
            .apply {
                onRetry?.let {
                    setNegativeButton("Retry") { _, _ -> it() }
                }
            }
            .show()
    }
}

// Use in Fragment/Activity
class BaseFragment : Fragment() {
    
    @Inject lateinit var errorHandler: ErrorHandler
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewLifecycleOwner.lifecycleScope.launch {
            errorHandler.errorEvent.collect { error ->
                errorHandler.showSnackbar(view, error)
            }
        }
    }
}
```

---

# 11. SUGGESTED IMPROVEMENTS & ADDITIONAL FEATURES

## 11.1 Short-term Enhancements (v2.0)

### 1. Voice Input Support
- Add voice-to-text for note taking
- Voice commands for common actions ("Call driver", "Mark complete")
- Hands-free operation while driving

### 2. Smart Notifications
- Configurable reminders for pending loads
- Daily summary notification
- Payment due reminders
- Location-based reminders (when near pickup/drop location)

### 3. Quick Statistics
- Weekly/Monthly/Yearly reports
- Revenue trend charts
- Driver performance metrics
- Truck utilization reports

### 4. Enhanced Search
- Fuzzy matching for truck numbers
- Search by date range
- Search by amount range
- Saved search filters

### 5. Bulk Operations
- Multi-select for batch status updates
- Bulk export to CSV
- Bulk SMS/WhatsApp

### 6. Offline Maps Integration
- Cache frequently used routes
- Offline location search
- GPS-based load tracking

## 11.2 Medium-term Features (v3.0)

### 1. Real-time Tracking
- Integrate with GPS tracking devices
- Real-time truck location on map
- ETA calculations
- Route optimization

### 2. Multi-user Support
- Role-based access control
- Data sync between devices
- Team management
- Activity audit log

### 3. E-way Bill Integration
- Auto-generate e-way bills
- E-way bill status tracking
- Expiry alerts

### 4. Invoice Generation
- Create professional invoices
- GST calculation
- Email/WhatsApp invoices
- Payment reminder automation

### 5. Client Portal
- Web interface for clients
- Real-time load tracking for clients
- Document sharing
- Payment gateway integration

### 6. Analytics Dashboard
- Revenue analytics
- Cost analysis
- Profit margins per route
- Seasonal trends

## 11.3 Long-term Vision (v4.0+)

### 1. AI/ML Features
- Predictive pricing suggestions
- Demand forecasting
- Anomaly detection in payments
- Smart route recommendations

### 2. Marketplace Integration
- Connect with load boards
- Post/find loads
- Rate negotiation
- Reputation system

### 3. Financial Integration
- Bank account linking
- Automatic payment reconciliation
- TDS calculation
- Financial statements

### 4. Compliance & Legal
- Document expiry tracking
- Insurance reminders
- RC/Fitness tracking
- Legal document templates

### 5. Advanced Reporting
- Custom report builder
- Scheduled reports via email
- Export to accounting software
- Tax-ready reports

### 6. IoT Integration
- Weighbridge integration
- Fuel sensor data
- Tire pressure monitoring
- Maintenance alerts

## 11.4 User Experience Improvements

### 1. Customizable Dashboard
- Drag-and-drop widgets
- User-defined KPIs
- Multiple dashboard layouts

### 2. Themes & Personalization
- Light theme option
- Custom accent colors
- Font size adjustment
- Compact card view

### 3. Accessibility
- TalkBack optimization
- High contrast mode
- Voice navigation
- Large touch targets

### 4. Performance
- Instant search
- Faster image loading
- Reduced memory footprint
- Battery optimization

### 5. Data Entry
- Smart form pre-filling
- Location autocomplete
- Recent values suggestion
- Template loads

### 6. Communication
- SMS templates
- WhatsApp templates
- Quick replies
- Call logs integration

---

# 12. APPENDIX

## 12.1 Color Theme Implementation

```kotlin
// colors.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Background Colors -->
    <color name="background_primary">#0B0B0B</color>
    <color name="background_secondary">#1A1A1A</color>
    <color name="background_card">#1A1A1A</color>
    <color name="background_elevated">#2A2A2A</color>
    
    <!-- Accent Colors -->
    <color name="accent_primary">#7B61FF</color>
    <color name="accent_success">#39FF14</color>
    <color name="accent_warning">#FF7A00</color>
    <color name="accent_error">#FF4444</color>
    
    <!-- Text Colors -->
    <color name="text_primary">#FFFFFF</color>
    <color name="text_secondary">#AAAAAA</color>
    <color name="text_tertiary">#666666</color>
    
    <!-- Status Colors -->
    <color name="status_active">#7B61FF</color>
    <color name="status_completed">#39FF14</color>
    <color name="status_problem">#FF7A00</color>
    <color name="status_cancelled">#666666</color>
    
    <!-- Borders -->
    <color name="border_default">#333333</color>
    <color name="border_highlight">#7B61FF</color>
    
    <!-- Overlay -->
    <color name="overlay_dark">#80000000</color>
</resources>

// themes.xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.FreightBroker" parent="Theme.Material3.Dark.NoActionBar">
        <item name="colorPrimary">@color/accent_primary</item>
        <item name="colorOnPrimary">@color/text_primary</item>
        <item name="colorSecondary">@color/accent_success</item>
        <item name="colorOnSecondary">@color/background_primary</item>
        <item name="colorError">@color/accent_error</item>
        <item name="colorOnError">@color/text_primary</item>
        <item name="android:colorBackground">@color/background_primary</item>
        <item name="colorOnBackground">@color/text_primary</item>
        <item name="colorSurface">@color/background_card</item>
        <item name="colorOnSurface">@color/text_primary</item>
        <item name="android:statusBarColor">@color/background_primary</item>
        <item name="android:navigationBarColor">@color/background_primary</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
```

## 12.2 Pre-populated Tags

```kotlin
// DefaultTags.kt
object DefaultTags {
    
    fun getNoteTags(): List<TagEntity> = listOf(
        TagEntity(name = "Driver Problem", category = TagCategory.NOTE, colorCode = "#FF7A00"),
        TagEntity(name = "Truck Problem", category = TagCategory.NOTE, colorCode = "#FF7A00"),
        TagEntity(name = "Payment Issue", category = TagCategory.NOTE, colorCode = "#FF4444"),
        TagEntity(name = "Client Issue", category = TagCategory.NOTE, colorCode = "#FF7A00"),
        TagEntity(name = "Loading Delay", category = TagCategory.NOTE, colorCode = "#FFCC00"),
        TagEntity(name = "Unloading Delay", category = TagCategory.NOTE, colorCode = "#FFCC00"),
        TagEntity(name = "Police Issue", category = TagCategory.NOTE, colorCode = "#FF4444"),
        TagEntity(name = "Accident", category = TagCategory.NOTE, colorCode = "#FF4444"),
        TagEntity(name = "Breakdown", category = TagCategory.NOTE, colorCode = "#FF7A00"),
        TagEntity(name = "Route Change", category = TagCategory.NOTE, colorCode = "#7B61FF")
    )
    
    fun getChargeTags(): List<TagEntity> = listOf(
        TagEntity(name = "Detainment", category = TagCategory.CHARGE, colorCode = "#FF7A00"),
        TagEntity(name = "Loading Labour", category = TagCategory.CHARGE, colorCode = "#7B61FF"),
        TagEntity(name = "Unloading Labour", category = TagCategory.CHARGE, colorCode = "#7B61FF"),
        TagEntity(name = "Union Fee", category = TagCategory.CHARGE, colorCode = "#FFCC00"),
        TagEntity(name = "Fuel Advance", category = TagCategory.CHARGE, colorCode = "#39FF14"),
        TagEntity(name = "Penalty", category = TagCategory.CHARGE, colorCode = "#FF4444"),
        TagEntity(name = "Bonus", category = TagCategory.CHARGE, colorCode = "#39FF14"),
        TagEntity(name = "Parking", category = TagCategory.CHARGE, colorCode = "#7B61FF"),
        TagEntity(name = "Toll", category = TagCategory.CHARGE, colorCode = "#7B61FF"),
        TagEntity(name = "RTO Fine", category = TagCategory.CHARGE, colorCode = "#FF4444")
    )
    
    fun getContactTags(): List<TagEntity> = listOf(
        TagEntity(name = "Driver", category = TagCategory.CONTACT, colorCode = "#7B61FF"),
        TagEntity(name = "Owner", category = TagCategory.CONTACT, colorCode = "#39FF14"),
        TagEntity(name = "Product Owner", category = TagCategory.CONTACT, colorCode = "#FFCC00"),
        TagEntity(name = "Second Driver", category = TagCategory.CONTACT, colorCode = "#7B61FF"),
        TagEntity(name = "Payment Person", category = TagCategory.CONTACT, colorCode = "#FF7A00"),
        TagEntity(name = "Agent", category = TagCategory.CONTACT, colorCode = "#7B61FF")
    )
    
    fun getAllDefaultTags(): List<TagEntity> = 
        getNoteTags() + getChargeTags() + getContactTags()
}
```

## 12.3 Database Migration Strategy

```kotlin
// FreightDatabase.kt
@Database(
    entities = [
        FreightEntity::class,
        TruckEntity::class,
        ContactEntity::class,
        FreightContactEntity::class,
        NoteEntity::class,
        TruckNoteEntity::class,
        ExtraChargeEntity::class,
        PaymentEntity::class,
        AttachmentEntity::class,
        TagEntity::class,
        SearchIndexEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class FreightDatabase : RoomDatabase() {
    abstract fun freightDao(): FreightDao
    abstract fun truckDao(): TruckDao
    abstract fun contactDao(): ContactDao
    abstract fun freightContactDao(): FreightContactDao
    abstract fun noteDao(): NoteDao
    abstract fun truckNoteDao(): TruckNoteDao
    abstract fun extraChargeDao(): ExtraChargeDao
    abstract fun paymentDao(): PaymentDao
    abstract fun attachmentDao(): AttachmentDao
    abstract fun tagDao(): TagDao
    abstract fun searchIndexDao(): SearchIndexDao
}

// Future migrations
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        // Add new columns or tables
        database.execSQL("ALTER TABLE freights ADD COLUMN pickup_date INTEGER")
        database.execSQL("ALTER TABLE freights ADD COLUMN delivery_date INTEGER")
    }
}

val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(database: SupportSQLiteDatabase) {
        // Add new tables
        database.execSQL("""
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL
            )
        """)
    }
}

// Build database
fun buildDatabase(context: Context): FreightDatabase {
    return Room.databaseBuilder(
        context,
        FreightDatabase::class.java,
        "freight_broker.db"
    )
        .addMigrations(MIGRATION_1_2, MIGRATION_2_3)
        .addCallback(object : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // Pre-populate default tags
                // Run in background thread
            }
        })
        .build()
}
```

---

## Summary

This comprehensive specification provides a complete blueprint for developing the Freight Broker Management Android application. The architecture emphasizes:

1. **Speed & Efficiency**: Minimal typing, quick actions, one-hand usability
2. **Clean Architecture**: MVVM pattern with clear separation of concerns
3. **Offline-First**: Local SQLite database with Room ORM
4. **Integration Ready**: Deep integration with Android intents for calls, WhatsApp, UPI payments
5. **Extensible**: Modular design allowing for future enhancements
6. **Data Safety**: Robust backup and restore system

The application is designed to be a powerful digital notebook for freight brokers, prioritizing operational speed and clarity over complex features.

---

*Document Version: 1.0*
*Last Updated: January 2024*
