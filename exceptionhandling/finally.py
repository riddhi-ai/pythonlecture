#use of finally
try:
    print("Processing Transaction")
    amount = int(input())

    if amount >10000:
        print("transaction approved")
        
except:
    print("Transaction failed")     #only when the input is other than int than only this will be executed 
finally:
    print("Thankyou")