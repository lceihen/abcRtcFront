# 这里其实是因为gitlab-ci.yml在根目录下执行的脚本，和文件位置无关，和文件执行的位置有关

file_name='./version'

pwd

ls

touch $file_name

line_count=$(wc -l <"$file_name")

log="$(git log -5 --pretty=format:"%h**%s**%cd |" --date=format:"%Y年%m月%d日%H时%M分%S秒")"

echo $log

handleWriteLog() {

    echo "$log" >"${file_name}.tmp"
    cat "$file_name" >>"$file_name.tmp"
    mv "$file_name.tmp" "$file_name"
    if [ "$line_count" -ge 5 ]; then
        head -n 5 "$file_name" >"$file_name.tmp"
        mv "$file_name.tmp" "$file_name"
    fi
    return 0
}

if handleWriteLog; then
    echo ""
else
    echo "命令执行失败，进行错误处理"
    exit 1
fi
