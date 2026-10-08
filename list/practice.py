#create a list of 10 numbers print the sum of last four elements of the list
#find out the difference between max and min element of the list
#insert a num in a list at 6th position this number must be 1/3rd of number stored at 4th position


numbers = [1,3,4,2,5,8,9,6,7,10]
print(numbers)
print("sum of the last four elements from the list numbers:", sum(numbers[-4:])) #this shows slicing till 4th 
difference=max(numbers)-min(numbers)
print("difference between max and min element of the list",difference)
insertinlist = numbers[3] / 3   #4th position  index 3
numbers.insert(5, insertinlist) #6th position  index 5
print("after inserting a number in list at 6th position",numbers.insert)
