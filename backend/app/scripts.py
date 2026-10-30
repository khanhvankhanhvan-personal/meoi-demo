"""Fixed replies that run BEFORE the LLM, plus the crisis banner content.

Text is taken from the prototype V28 `script(id)` and `CR`. The banner uses the verified CSAGA number
024 3333 5599 (the prototype banner had a wrong one, see docs content-framework section 2).
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Script:
    tier: str
    suggestions: list[str]
    segments: list[str]


_PSY_IN_HOURS = (
    "Mẹ gọi HOPE ngay bây giờ nhé (0865 044 400, mở 16:30–20:30). "
    "Nếu mẹ thấy không an toàn, gọi 115."
)
_PSY_OUT_OF_HOURS = (
    "HOPE đã hết giờ hôm nay (16:30–20:30), nên mẹ gọi 115 hoặc đến bệnh viện gần nhất ngay, "
    "đừng chờ đợi. Và báo cho người thân tin cậy gần nhất để họ ở cạnh mẹ."
)

_FIXED: dict[str, Script] = {
    "cry": Script(
        "1",
        ["Con hơi sốt", "Con bú kém"],
        [
            "Nghe mẹ kể là mình thương mẹ lắm. Một buổi chiều nghe con khóc mãi thì ai cũng kiệt sức.",
            "Bé khóc nhiều vào chiều tối là chuyện rất phổ biến ở trẻ sơ sinh, nhiều người gọi là khóc dạ đề. Không phải lỗi của mẹ đâu.",
            "Nếu có người ở nhà, mẹ thử nhờ họ bế con 15 phút để mẹ đi tắm hoặc ngồi yên một chút nhé.",
        ],
    ),
    "milk": Script(
        "2",
        ["Bé ít đi tiểu hơn", "Bé vẫn tăng cân đều"],
        [
            "Cảm giác sữa không đủ rất phổ biến, và nhiều khi không phản ánh đúng thực tế.",
            "Thường thì nếu bé có đủ tã ướt và tăng cân đều theo lịch khám, đó là dấu hiệu ổn, dù mẹ có thể không cảm nhận được.",
            "Mỗi bé mỗi khác, nên nếu mẹ thấy khác với những gì mình vừa nói, mẹ hỏi bác sĩ nhi hoặc chuyên gia tư vấn sữa mẹ giúp mình nhé.",
        ],
    ),
    "milkok": Script(
        "2",
        [],
        [
            "Vậy thì đó thường là dấu hiệu ổn, mẹ ạ.",
            "Nếu mẹ vẫn thấy lo, mẹ cứ hỏi bác sĩ nhi ở lần khám tới, không cần chờ có chuyện mới hỏi.",
        ],
    ),
    "phys": Script(
        "3-PHYSICAL",
        [],
        [
            "Đây là điều mẹ nên được bác sĩ kiểm tra ngay.",
            "Nếu khẩn cấp, mẹ gọi 115 giúp mình nhé.",
            "Mẹ nhờ người ở gần đưa mẹ đi cùng, đừng đi một mình.",
        ],
    ),
    "baby3": Script(
        "3-PHYSICAL",
        [],
        [
            "Đây là điều nên được bác sĩ nhi kiểm tra sớm, mẹ nhé.",
            "Mẹ đừng tự điều chỉnh hay chờ đến sáng. Nếu khẩn cấp, gọi 115.",
        ],
    ),
    "safe": Script(
        "3-SAFETY",
        [],
        [
            "Mình rất tiếc mẹ đang trải qua điều này. Bị đe dọa, bị kiểm soát hay bạo lực, dưới bất kỳ hình thức nào, đều không còn là căng thẳng bình thường.",
            "Mẹ xứng đáng được an toàn. Mẹ có thể liên hệ CSAGA (024 3333 5599) hoặc Ngôi nhà Bình yên (1900 969 680), họ hỗ trợ kín đáo.",
        ],
    ),
    "oos": Script(
        "2",
        [],
        [
            "Mình chưa có đủ thông tin đáng tin cậy về bé 2 tuổi, và mình không muốn nói bừa với mẹ.",
            "Mẹ hỏi bác sĩ nhi hoặc chuyên viên dinh dưỡng giúp mình nhé.",
            "Còn nếu mẹ đang mệt vì chuyện này, mình ở đây nghe mẹ.",
        ],
    ),
    "hold": Script(
        "1",
        [],
        [
            "Có, rất bình thường ạ. Con tìm thấy sự an toàn quen thuộc nhất ở mẹ nên chỉ chịu mẹ bế.",
            "Còn mẹ thì bế cả ngày đến mỏi tay muốn khóc, mình nghĩ mẹ cũng cần được nghỉ thật sự.",
            "Hôm nay có lúc nào mẹ được ai đó đỡ tay không?",
        ],
    ),
}


def get_script(script_id: str, hope_is_open: bool) -> Script:
    if script_id == "psy":
        return Script(
            "3-PSYCHIATRIC",
            [],
            [
                "Cảm ơn mẹ đã nói ra với mình. Mẹ không cần tự xử lý điều này một mình.",
                _PSY_IN_HOURS if hope_is_open else _PSY_OUT_OF_HOURS,
            ],
        )
    return _FIXED[script_id]


@dataclass(frozen=True)
class Contact:
    name: str
    phone: str


@dataclass(frozen=True)
class Crisis:
    kind: str  # PHYSICAL | PSYCHIATRIC | SAFETY
    label: str
    body: str
    contacts: list[Contact]


def crisis_for(tier: str, hope_is_open: bool) -> Crisis | None:
    """Crisis banner content for a Tier 3 reply; None for Tier 1/2."""
    if tier == "3-PHYSICAL":
        return Crisis(
            "PHYSICAL",
            "Cần bác sĩ kiểm tra ngay",
            "Đây là điều nên được bác sĩ kiểm tra ngay, mẹ nhé.",
            [Contact("Cấp cứu 115", "115")],
        )
    if tier == "3-PSYCHIATRIC":
        label = "Mẹ không cần tự xử lý một mình"
        if hope_is_open:
            return Crisis(
                "PSYCHIATRIC",
                label,
                "Điều này cần một người thật lắng nghe mẹ ngay bây giờ.",
                [Contact("HOPE (16:30–20:30)", "0865044400"), Contact("Cấp cứu 115", "115")],
            )
        return Crisis(
            "PSYCHIATRIC",
            label,
            "HOPE hiện đã ngoài giờ (16:30–20:30). Mẹ gọi 115 ngay, hoặc báo cho người thân tin cậy gần nhất.",
            [Contact("Gọi 115 ngay", "115")],
        )
    if tier == "3-SAFETY":
        return Crisis(
            "SAFETY",
            "Đây không còn là căng thẳng bình thường",
            "Mẹ xứng đáng được an toàn. Có người sẵn sàng hỗ trợ mẹ kín đáo.",
            [Contact("CSAGA", "02433335599"), Contact("Ngôi nhà Bình yên", "1900969680")],
        )
    return None
