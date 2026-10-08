#empty list

#to access the list element using index 0 is the first element and -1 is last
numbers=[10,20,30,40]
print(numbers[0])
print(numbers[-2])

#operations on list
#append item in list in the end
colors =["red","blue"]
colors.append("pink")
print("After appending",colors)

#insert at specific location
colors.insert(1,"yellow")
print("After insertion at second position",colors)

#remove
print("before remove",colors)
colors.remove("red")
print("after removal")

#pop removes last item
last_color = colors.pop()
print(last_color)
print("after pop operation",colors)


#create a list of 10 numbers print the sum of last four elements of the list
#find out the difference between max and min element of the list
#insert a num in a list at 6th position this number must be 1/3rd of number stored at 4th position
