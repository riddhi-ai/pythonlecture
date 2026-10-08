#08-10-26
#in dictionary values are immutable and dictionary is mutable

#create a nested dictionary with student 
student = {
    101:{"Name":"Riddhi","Scores":[89,78,90]},
    103:{"Name":"Raha","Scores":[75,89,80]},
    104:{"Name":"Neha","Scores":[76,59,50]},
    105:{"Name":"Aditi","Scores":[30,19,10]},
    106:{"Name":"Siddhi","Scores":[70,99,80]},

}

#calculate avg score and flag pass/fail
for S_ID, details in student.items():
    avg= sum(details["Scores"])/len(details["Scores"])
    details["Average"]=avg
    details["Passed"]=avg>=50 #boolean flag


#print names of students who passed
print("Students who passed:")
for S_ID, details in student.items():
    if details["Passed"]:
        print(details["Name"])


# print names of students who failed
print("\nStudents who failed:")
for S_ID, details in student.items():
    if not details["Passed"]:   # fail condition
        print(details["Name"])