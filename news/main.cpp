#include <iostream>
using namespace std;
int main() 
{
    int a=3,b=7;
    int temp = a;
    a = b;
    b = temp;
    cout<<"a="<<a;
    cout<<"\nb="<<b;
    return 0;
}