#Min Max in an Array

Arr = [1,2,3,4,5]
min= Arr[0]
max= Arr[0]

for num in Arr:
    if num < min:
        min=num
    if num >max:
        max=num
    print ("Maximum:",max)
    print("Minimum:",min)