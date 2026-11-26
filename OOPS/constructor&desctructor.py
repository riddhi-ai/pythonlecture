# Constructor Counter using Class Variable

class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        Student.count += 1
        print("Student Created:", self.name)

    def __del__(self):
        Student.count -= 1
        print("Student Deleted:", self.name)

    @classmethod
    def total_students(cls):
        print("Total Objects:", cls.count)


s1 = Student("A")
s2 = Student("B")
s3 = Student("C")

Student.total_students()

del s2

Student.total_students()