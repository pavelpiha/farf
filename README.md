# farf

farf means find and rename files/directories

Small cli app recursively changes files and directories names

## <a name="installation"></a>Installation
```console
npm i -g farf
```

## <a name="help"></a>Help
```console
farf -h
```

## <a name="example"></a>Example


Change all files and directories names containing **old** into **new** in **5** directories deep **from directory where application were run**

```console
farf -d 5 -f old -n new
```

if `depth > 10 && depth <=15` next confirmation question will be seen:
```console
Are you sure to continue with such depth? (YES/NO):
```

