#create a list of numbers and strings accept the values from user separate the list from the maximum number display the names in the descending order

list = input("Enter the values :").split()

numbers = [int(v) for v in list if v.isdigit()]
names   = [v for v in list if not v.isdigit()]

max_num = max(numbers) #to find maximum number

sorted_names = sorted(names, reverse=True)  #to sort names in descending order

print("Maximum number:", max_num)
print("Names in descending order:", sorted_names)
