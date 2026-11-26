# Getter and Setter

class Student:
    def __init__(self):
        self.__marks = 0

    def get_marks(self):
        return self.__marks

    def set_marks(self, marks):
        self.__marks = marks


s = Student()

print("Before Setter Marks are:", s.get_marks())

s.set_marks(85)

print("After Setter Marks are:", s.get_marks())