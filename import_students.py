import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Default values
default_data = {
    "department": "AI & ML",
    "course": "B.Sc",
    "semester": "Semester 2",
    "section": "EM",
    "branch": "AI & ML",
    "status": "Active"
}

# Student list
students = [
    {"rollNumber": "245901", "studentName": "AVALA ANAND BABU"},
    {"rollNumber": "245902", "studentName": "DASIKA SARATH KUMAR"},
    {"rollNumber": "245903", "studentName": "SHAIK NAADIA TASLEEM"},
    {"rollNumber": "245904", "studentName": "CHIKATI YUGALA SRI"},
    {"rollNumber": "245905", "studentName": "ORSU BRAHMAIAH"},
    {"rollNumber": "245906", "studentName": "GUNDALA VENKAT"},
    {"rollNumber": "245907", "studentName": "PATAN MASTAN"},
    {"rollNumber": "245908", "studentName": "PATNALA VISWA TEJA"},
    {"rollNumber": "245910", "studentName": "KUPPILA BALAJIREDDY"},
    {"rollNumber": "245911", "studentName": "KAMBAMPATI NEELIMA SAI"},
    {"rollNumber": "245912", "studentName": "SHAIK ZAKEER BASHA"},
    {"rollNumber": "245913", "studentName": "PALLI VIKRAMADITHYA"},
    {"rollNumber": "245914", "studentName": "NATHAM MANOJ KUMAR"},
    {"rollNumber": "245915", "studentName": "PATTAN AMEERKHAN"},
    {"rollNumber": "245916", "studentName": "PYDIPOTHU NIVYA"},
    {"rollNumber": "245917", "studentName": "GUTI KRISHNA SWAMY"},
    {"rollNumber": "245918", "studentName": "KARRA THARUN KOMMURU"},
    {"rollNumber": "245919", "studentName": "PAVANKUMAR"},
    {"rollNumber": "245920", "studentName": "KOPPURAVURI NAVYA CHARITHA"},
    {"rollNumber": "245922", "studentName": "KONA BHAVANI BHARGAVA"},
    {"rollNumber": "245923", "studentName": "RAVINUTHALA NAGA SRIKARI"},
    {"rollNumber": "245924", "studentName": "MADDULA NAMITHA"},
    {"rollNumber": "245925", "studentName": "YENDURI KUSHWANTH SAI TARUN"},
    {"rollNumber": "245926", "studentName": "PANDITHARADHYULA SRI DURGA VA"},
    {"rollNumber": "245927", "studentName": "PULIPATI TULASIPRIYA"},
    {"rollNumber": "245928", "studentName": "VIJJI RAJESH GANDEPASLI"},
    {"rollNumber": "245929", "studentName": "CHANDRA SAI CHAITH"},
    {"rollNumber": "245931", "studentName": "GUDELA SURYA"},
    {"rollNumber": "245933", "studentName": "KOTI BHAVANA"},
    {"rollNumber": "245934", "studentName": "ONGOLE HAMSIKA LAKSHMI"},
    {"rollNumber": "245935", "studentName": "DASARI AJAY BABU THANUKU"},
    {"rollNumber": "245936", "studentName": "BHASKAR TEJA"},
    {"rollNumber": "245938", "studentName": "ZABI ARSALAAN KHAN"},
    {"rollNumber": "245939", "studentName": "NANDAM YASWANTH"},
    {"rollNumber": "245940", "studentName": "JUPALLI SEKHAR"},
    {"rollNumber": "245942", "studentName": "MURKIPUTTI GABRIEL SAMUEL"},
    {"rollNumber": "245943", "studentName": "MUDRABOINA VAMSI"},
    {"rollNumber": "245944", "studentName": "M KALEB VIKAS"},
    {"rollNumber": "245945", "studentName": "SK ABDUL REHAMAN"},
    {"rollNumber": "245946", "studentName": "N LAKSHMI BALAJI"},
    {"rollNumber": "245948", "studentName": "KANDUKURI MANOJ KUMAR"},
    {"rollNumber": "245949", "studentName": "CHINTALA DILEEP KUMAR KAVITAPU"},
    {"rollNumber": "245950", "studentName": "DHANUSH"},
    {"rollNumber": "245951", "studentName": "NANNAM KHATWANG"},
    {"rollNumber": "245952", "studentName": "NAKKA ANAND KUMAR"},
    {"rollNumber": "245953", "studentName": "J KUMAR SWAMYREDDY"},
    {"rollNumber": "245954", "studentName": "T TEJASWINI"},
    {"rollNumber": "245955", "studentName": "SHAIK AZEEM MOHIDDIN"},
    {"rollNumber": "245956", "studentName": "MUCHINAPALLI RUPAK VENKATA SAI"},
    {"rollNumber": "245957", "studentName": "V VENKATA NAGA ADITHYA"},
    {"rollNumber": "245958", "studentName": "T VENKATA SURENDRA"},
    {"rollNumber": "245959", "studentName": "L YASWANTH VENKAT"},
    {"rollNumber": "245960", "studentName": "VIKRAM AKASH"},
    {"rollNumber": "245961", "studentName": "VADUGU DHANUSH"},
    {"rollNumber": "245962", "studentName": "PARASANABOINA MUKESH"}
]

def batch_insert_students(students_list):
    batch = db.batch()
    batch_counter = 0
    
    for student in students_list:
        doc_ref = db.collection("students").document(student["rollNumber"])
        doc_data = {**default_data, **student}
        batch.set(doc_ref, doc_data)
        batch_counter += 1
        
        if batch_counter == 500:
            batch.commit()
            batch = db.batch()
            batch_counter = 0
            
    if batch_counter > 0:
        batch.commit()
        
    print(f"Successfully inserted {len(students_list)} students using Batch Write!")

if __name__ == "__main__":
    batch_insert_students(students)